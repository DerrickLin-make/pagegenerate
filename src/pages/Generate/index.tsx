import {
  BulbOutlined,
  CheckCircleOutlined,
  CloudDownloadOutlined,
  FileTextOutlined,
  KeyOutlined,
  RedoOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Row,
  Space,
  Spin,
  Tag,
  Typography
} from 'antd';
import React from 'react';
import OutlineEditor from '../../components/OutlineEditor';
import {
  fetchTitleSuggestions,
  formatErrorMessage,
  generatePaperContent,
  generatePaperOutline,
  validateApiKey
} from '../../services/difyApi';

const { Title, Paragraph, Text } = Typography;

interface GenerateFormValues {
  title: string;
  major?: string;
  direction?: string;
  wordCount?: number;
  description?: string;
}

type LoadingState = {
  outline: boolean;
  content: boolean;
  suggestions: boolean;
  validateKey: boolean;
  saveOutline: boolean;
};

const initialLoadingState: LoadingState = {
  outline: false,
  content: false,
  suggestions: false,
  validateKey: false,
  saveOutline: false
};

const GeneratePage: React.FC = () => {
  const [form] = Form.useForm<GenerateFormValues>();
  const [loading, setLoading] = React.useState(initialLoadingState);
  const [outline, setOutline] = React.useState('');
  const [editedOutline, setEditedOutline] = React.useState('');
  const [content, setContent] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [apiKey, setApiKey] = React.useState('');
  const [apiKeyStatus, setApiKeyStatus] = React.useState<'idle' | 'valid' | 'invalid'>('idle');

  const updateLoading = React.useCallback((partial: Partial<LoadingState>) => {
    setLoading((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleGenerateOutline = React.useCallback(async () => {
    setError(null);
    const values = await form.validateFields(['title', 'major', 'direction', 'wordCount', 'description']);
    updateLoading({ outline: true });
    try {
      const outlineText = await generatePaperOutline(
        {
          title: values.title,
          major: values.major,
          direction: values.direction,
          wordCount: values.wordCount,
          description: values.description
        },
        apiKey
      );
      setOutline(outlineText);
      setEditedOutline(outlineText);
      setContent('');
      message.success('已生成论文大纲');
    } catch (err) {
      const formatted = formatErrorMessage(err);
      setError(formatted);
      message.error(formatted);
    } finally {
      updateLoading({ outline: false });
    }
  }, [apiKey, form, updateLoading]);

  const handleSaveOutline = React.useCallback(async () => {
    if (!editedOutline) {
      message.warning('请先完善大纲内容');
      return;
    }
    updateLoading({ saveOutline: true });
    try {
      setOutline(editedOutline);
      message.success('大纲已保存，可用于生成正文');
    } finally {
      updateLoading({ saveOutline: false });
    }
  }, [editedOutline, updateLoading]);

  const handleGenerateContent = React.useCallback(async () => {
    setError(null);
    const values = form.getFieldsValue();
    if (!editedOutline) {
      message.warning('请先生成并确认大纲');
      return;
    }
    updateLoading({ content: true });
    try {
      const contentText = await generatePaperContent(
        {
          outline: editedOutline,
          wordCount: values.wordCount
        },
        apiKey
      );
      setContent(contentText);
      message.success('正文生成完成');
    } catch (err) {
      const formatted = formatErrorMessage(err);
      setError(formatted);
      message.error(formatted);
    } finally {
      updateLoading({ content: false });
    }
  }, [apiKey, editedOutline, form, updateLoading]);

  const handleFetchSuggestions = React.useCallback(async () => {
    const { title: seedText } = await form.validateFields(['title']);
    setError(null);
    updateLoading({ suggestions: true });
    try {
      const result = await fetchTitleSuggestions(seedText, apiKey);
      setSuggestions(result);
      if (result.length === 0) {
        message.info('未获取到更多标题建议，可尝试修改输入');
      } else {
        message.success('已获取标题建议');
      }
    } catch (err) {
      const formatted = formatErrorMessage(err);
      setError(formatted);
      message.error(formatted);
    } finally {
      updateLoading({ suggestions: false });
    }
  }, [apiKey, form, updateLoading]);

  const handleValidateKey = React.useCallback(async () => {
    if (!apiKey) {
      message.warning('请输入要校验的 API Key');
      return;
    }
    updateLoading({ validateKey: true });
    try {
      const valid = await validateApiKey(apiKey);
      setApiKeyStatus(valid ? 'valid' : 'invalid');
      if (valid) {
        message.success('API Key 校验通过');
      } else {
        message.error('API Key 无效，请检查后重试');
      }
    } catch (err) {
      setApiKeyStatus('invalid');
      const formatted = formatErrorMessage(err);
      message.error(formatted);
    } finally {
      updateLoading({ validateKey: false });
    }
  }, [apiKey, updateLoading]);

  return (
    <div className="page-container">
      <Title level={2}>论文生成中心</Title>
      <Paragraph type="secondary">
        输入论文基本信息并调用 Dify 工作流自动生成大纲与正文。可在生成过程中查看错误提示与重试建议。
      </Paragraph>

      <Card title="Dify API Key（可选）" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={16}>
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="输入 Dify 应用的 API Key"
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value);
                setApiKeyStatus('idle');
              }}
              autoComplete="off"
            />
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button
                type="primary"
                onClick={handleValidateKey}
                loading={loading.validateKey}
                icon={<CheckCircleOutlined />}
              >
                校验 Key
              </Button>
              {apiKeyStatus === 'valid' && <Tag color="success">已通过校验</Tag>}
              {apiKeyStatus === 'invalid' && <Tag color="error">校验失败</Tag>}
            </Space>
          </Col>
        </Row>
        <Paragraph type="secondary" style={{ marginTop: 12 }}>
          出于安全考虑，推荐在浏览器中临时输入 Key 或通过后端代理隐藏密钥。若不填写，则使用默认浏览器配置。
        </Paragraph>
      </Card>

      <Card title="论文信息填写">
        <Form<GenerateFormValues>
          layout="vertical"
          form={form}
          initialValues={{ wordCount: 3000 }}
        >
          <Form.Item
            label="论文题目"
            name="title"
            rules={[{ required: true, message: '请输入论文题目或主题' }]}
          >
            <Input placeholder="示例：基于深度学习的文本摘要生成研究" allowClear />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="专业" name="major">
                <Input placeholder="示例：计算机科学与技术" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="研究方向" name="direction">
                <Input placeholder="示例：自然语言处理" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="字数要求" name="wordCount">
                <InputNumber
                  className="full-width"
                  min={500}
                  max={20000}
                  placeholder="请输入期望字数"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="补充说明" name="description">
                <Input.TextArea
                  placeholder="示例：需包含相关工作综述、模型设计、实验与结论"
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Space size="middle" wrap>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleGenerateOutline}
              loading={loading.outline}
            >
              生成大纲
            </Button>
            <Button
              icon={<BulbOutlined />}
              onClick={handleFetchSuggestions}
              loading={loading.suggestions}
            >
              获取标题建议
            </Button>
            <Button
              icon={<RedoOutlined />}
              onClick={() => {
                form.resetFields();
                setOutline('');
                setEditedOutline('');
                setContent('');
                setSuggestions([]);
                setError(null);
              }}
            >
              清空表单
            </Button>
          </Space>
        </Form>
      </Card>

      {suggestions.length > 0 && (
        <Card
          title={
            <Space>
              <BulbOutlined />
              <span>标题建议</span>
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <List
            dataSource={suggestions}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="apply"
                    type="link"
                    onClick={() => form.setFieldsValue({ title: item })}
                  >
                    应用
                  </Button>
                ]}
              >
                <List.Item.Meta title={item} />
              </List.Item>
            )}
          />
        </Card>
      )}

      {outline && (
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>论文大纲</span>
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <OutlineEditor
            value={editedOutline}
            onChange={setEditedOutline}
            onSubmit={handleSaveOutline}
            disabled={loading.outline || loading.content}
            loading={loading.saveOutline}
          />
          <Divider />
          <Space direction="vertical" size="middle" className="full-width">
            <Typography.Text type="secondary">
              确认大纲无误后即可生成正文。若正文生成失败，可参考错误提示进行调整。
            </Typography.Text>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={handleGenerateContent}
              loading={loading.content}
              disabled={loading.outline || !editedOutline}
            >
              生成正文
            </Button>
          </Space>
        </Card>
      )}

      {error && (
        <Alert
          style={{ marginTop: 24 }}
          type="error"
          showIcon
          message="出现错误"
          description={error}
        />
      )}

      {loading.content && (
        <Card style={{ marginTop: 24 }}>
          <Space>
            <Spin />
            <Text>正在生成正文，耗时可能较长，请耐心等待…</Text>
          </Space>
        </Card>
      )}

      {content && (
        <Card
          className="result-card"
          title={
            <Space>
              <FileTextOutlined />
              <span>生成正文</span>
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography.Paragraph>
        </Card>
      )}
    </div>
  );
};

export default GeneratePage;
