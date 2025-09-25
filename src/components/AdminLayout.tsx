import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Space,
  Avatar,
  Dropdown,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  SafetyOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '概览',
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: '/rooms',
      icon: <CodeOutlined />,
      label: '房间管理',
    },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          {!collapsed && (
            <Title level={4} style={{ margin: '0 0 0 8px', color: '#1890ff' }}>
              管理后台
            </Title>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <Title level={3} style={{ margin: 0 }}>
            {title || '管理后台'}
          </Title>
          
          <Space>
            <span>欢迎, {user?.username}</span>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: '24px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
