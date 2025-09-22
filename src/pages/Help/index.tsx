import { Alert, Card, Col, Collapse, Row, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph, Text } = Typography;

const HelpPage: React.FC = () => {
  return (
    <div className="page-container">
      <Title level={2}>使用帮助</Title>
      <Paragraph>
        本页面汇总了论文生成助手的使用方法、常见问题以及网络错误的排查建议，帮助你快速定位问题并完成论文内容的生成。
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="快速上手">
            <Paragraph>
              1. 在“生成论文”页面填写论文题目、专业、研究方向、字数等信息后点击“生成大纲”。
            </Paragraph>
            <Paragraph>
              2. 在大纲编辑器中根据需要调整大纲结构，点击“保存编辑”确认。
            </Paragraph>
            <Paragraph>
              3. 点击“生成正文”触发工作流生成论文正文，耐心等待生成完成。
            </Paragraph>
            <Paragraph>
              4. 若需要更多标题灵感，可使用“获取标题建议”功能获取多个候选题目。
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="关键提醒">
            <Paragraph>
              <Text strong>安全性：</Text> 建议在临时环境中输入 API Key，或由后端代理完成调用，避免密钥泄露。
            </Paragraph>
            <Paragraph>
              <Text strong>长耗时任务：</Text> 若生成正文耗时较长，可考虑改为流式模式或异步轮询。
            </Paragraph>
            <Paragraph>
              <Text strong>重试策略：</Text> 若发生 504 或网络波动，可稍后重试，或减少输入内容优化请求耗时。
            </Paragraph>
          </Card>
        </Col>
      </Row>

      <Card title="常见问题" style={{ marginTop: 24 }}>
        <Collapse accordion>
          <Collapse.Panel header="为何会提示 API Key 校验失败？" key="1">
            <Paragraph>
              请确认输入的 Key 对应 Dify 应用的类型与权限一致，并确保未包含多余空格。若仍失败，可尝试通过后端校验接口验证。
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel header="生成正文时报错 504/超时怎么办？" key="2">
            <Paragraph>
              504 通常表示任务耗时过长，建议缩减字数、拆分章节或改用流式输出模式。也可以采用“提交任务 + 轮询结果”的方式规避超时。
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel header="如何处理网络或 CORS 错误？" key="3">
            <Paragraph>
              请确认本地开发代理 <Text code>/v1/*</Text> 是否生效，以及浏览器是否拦截了跨域请求。必要时可在开发工具中查看网络日志进行排查。
            </Paragraph>
          </Collapse.Panel>
          <Collapse.Panel header="是否支持导出生成的内容？" key="4">
            <Paragraph>
              当前版本可复制文本内容到本地文档，后续可扩展导出为 Markdown、PDF 等格式。
            </Paragraph>
          </Collapse.Panel>
        </Collapse>
      </Card>

      <Alert
        style={{ marginTop: 24 }}
        message="遇到问题？"
        description="可在生成页面的错误提示中查看详细原因与恢复建议，必要时调整输入或稍后重试。"
        type="info"
        showIcon
      />
    </div>
  );
};

export default HelpPage;
