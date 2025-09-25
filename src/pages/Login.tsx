import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { login, loginLoading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 组件加载时从localStorage读取保存的账号密码
  useEffect(() => {
    const savedCredentials = localStorage.getItem('admin_saved_credentials');
    if (savedCredentials) {
      try {
        const { username, password, remember } = JSON.parse(savedCredentials);
        if (remember) {
          form.setFieldsValue({
            username,
            password,
            remember: true
          });
        }
      } catch (error) {
        console.error('Failed to parse saved credentials:', error);
      }
    }
  }, [form]);

  const onFinish = async (values: { username: string; password: string; remember?: boolean }) => {
    const { username, password, remember } = values;

    // 处理记住密码
    if (remember) {
      localStorage.setItem('admin_saved_credentials', JSON.stringify({
        username,
        password,
        remember: true
      }));
    } else {
      localStorage.removeItem('admin_saved_credentials');
    }

    const success = await login({ username, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              管理后台
            </Title>
            <Text type="secondary">Interview System Admin Panel</Text>
          </div>

          <Form
            name="login"
            form={form}
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入管理员用户名!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="管理员用户名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>记住密码</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginLoading}
                size="large"
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              只有管理员账户可以访问此系统
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
