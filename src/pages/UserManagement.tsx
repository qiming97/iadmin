import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { usersAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import dayjs from 'dayjs';
const { Option } = Select;

interface User {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleDelete = async (userId: string) => {
    try {
      await usersAPI.deleteUser(userId);
      message.success('删除用户成功');
      loadUsers();
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await usersAPI.updateUser(editingUser.id, values);
        message.success('更新用户成功');
      } else {
        await usersAPI.createUser(values);
        message.success('创建用户成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '操作失败';
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑用户"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="删除用户"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout title="用户管理">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          创建用户
        </Button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 700, y: 'calc(100vh - 300px)' }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            responsive: true,
          }}
          size="middle"
        />
      </div>

      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input placeholder="输入用户名" />
          </Form.Item>



          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Option value="user">用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              <Option value={true}>活跃</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default UserManagement;
