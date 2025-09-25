import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Space,
  Avatar,
  Dropdown,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  SafetyOutlined,
  UsergroupAddOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { usersAPI, roomsAPI } from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    activeRooms: 0,
    onlineUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersResponse, roomsResponse] = await Promise.all([
        usersAPI.getAllUsers(),
        roomsAPI.getAllRooms(),
      ]);

      const users = usersResponse.data;
      const rooms = roomsResponse.data;

      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        activeRooms: rooms.filter((room: any) => room.status === 'active').length,
        onlineUsers: users.filter((user: any) => user.isActive).length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

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
            系统概览
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
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="总用户数"
                    value={stats.totalUsers}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="总房间数"
                    value={stats.totalRooms}
                    prefix={<CodeOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
          
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="在线用户"
                    value={stats.onlineUsers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="快速操作" style={{ height: 300 }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Card
                      hoverable
                      size="small"
                      onClick={() => navigate('/users')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Meta
                        avatar={<TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                        title="用户管理"
                        description="管理系统用户，创建、编辑、删除用户账户"
                      />
                    </Card>
                    <Card
                      hoverable
                      size="small"
                      onClick={() => navigate('/rooms')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Meta
                        avatar={<CodeOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                        title="房间管理"
                        description="管理协作房间，查看房间状态和成员信息"
                      />
                    </Card>
                  </Space>
                </Card>
              </Col>
           
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
