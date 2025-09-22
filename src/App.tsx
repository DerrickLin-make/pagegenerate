import { FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';
import React from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import GeneratePage from './pages/Generate';
import HelpPage from './pages/Help';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const location = useLocation();
  const selectedKeys = React.useMemo(() => {
    if (location.pathname.startsWith('/help')) {
      return ['help'];
    }
    if (location.pathname.startsWith('/generate')) {
      return ['generate'];
    }
    return [];
  }, [location.pathname]);

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Typography.Title level={4} className="app-logo">
          论文生成助手
        </Typography.Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selectedKeys}
          items={[
            {
              key: 'generate',
              icon: <FileTextOutlined />,
              label: <Link to="/generate">生成论文</Link>
            },
            {
              key: 'help',
              icon: <QuestionCircleOutlined />,
              label: <Link to="/help">使用帮助</Link>
            }
          ]}
        />
      </Header>
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/generate" replace />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/generate" replace />} />
        </Routes>
      </Content>
      <Footer className="app-footer">
        <Typography.Text type="secondary">
          © {new Date().getFullYear()} 论文生成助手 · 基于 Dify API 构建
        </Typography.Text>
      </Footer>
    </Layout>
  );
};

export default App;
