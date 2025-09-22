import { SaveOutlined } from '@ant-design/icons';
import { Button, Input, Space, Typography } from 'antd';
import React from 'react';

type OutlineEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const OutlineEditor: React.FC<OutlineEditorProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  loading
}) => {
  return (
    <Space direction="vertical" size="middle" className="full-width">
      <Typography.Text type="secondary">
        生成的大纲可在此处进行修改。调整后点击“保存编辑”以用于后续正文生成。
      </Typography.Text>
      <Input.TextArea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoSize={{ minRows: 12, maxRows: 24 }}
        disabled={disabled}
        placeholder="请输入或编辑论文大纲..."
      />
      {onSubmit && (
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSubmit}
          disabled={disabled}
          loading={loading}
        >
          保存编辑
        </Button>
      )}
    </Space>
  );
};

export default OutlineEditor;
