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
  Tooltip,
  Card,
  Row,
  Col,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CodeOutlined,
  EyeOutlined,
  CopyOutlined,
  KeyOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { roomsAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import dayjs from 'dayjs';
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Room {
  id: string;
  name: string;
  description: string;
  roomCode: string;
  password?: string;
  status: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  onlineCount?: number;
  creator?: {
    id: string;
    username: string;
  };
  members: Array<{
    id: string;
    username: string;
    role: string;
    isOnline: boolean;
  }>;
}

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    // 初始化时设置默认状态并加载数据
    searchForm.setFieldsValue({ status: 'normal' });
    loadRooms({ status: 'normal' });
  }, []);

  const loadRooms = async (searchParams?: any, page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize,
        ...searchParams,
      };
      
      const response = await roomsAPI.searchRooms(params);
      setRooms(response.data.rooms);
      setPagination({
        current: page,
        pageSize,
        total: response.data.total,
      });
    } catch (error) {
      message.error('加载房间列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setModalVisible(true);
    form.setFieldsValue({
      name: room.name,
      description: room.description,
      password: '', // 编辑时不显示现有密码
      status: room.status,
      language: room.language,
    });
  };

  const handleDelete = async (roomId: string) => {
    try {
      await roomsAPI.deleteRoom(roomId);
      message.success('删除房间成功');
      handleSearch();
    } catch (error) {
      message.error('删除房间失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRoom) {
        await roomsAPI.updateRoom(editingRoom.id, values);
        message.success('更新房间成功');
      } else {
        await roomsAPI.createRoom(values);
        message.success('创建房间成功');
      }
      setModalVisible(false);
      form.resetFields();
      handleSearch();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '操作失败';
      message.error(errorMessage);
    }
  };

  const handleSearch = async (values?: any) => {
    const searchParams = values || searchForm.getFieldsValue();
    
    // 处理日期范围
    if (searchParams.createdAtRange) {
      searchParams.createdAtStart = searchParams.createdAtRange[0]?.format('YYYY-MM-DD');
      searchParams.createdAtEnd = searchParams.createdAtRange[1]?.format('YYYY-MM-DD');
      delete searchParams.createdAtRange;
    }
    
    // 移除空值
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key]) {
        delete searchParams[key];
      }
    });
    
    await loadRooms(searchParams, 1, pagination.pageSize);
  };

  const handleReset = () => {
    searchForm.resetFields();
    // 重置后设置默认状态为正常
    searchForm.setFieldsValue({ status: 'normal' });
    loadRooms({ status: 'normal' }, 1, pagination.pageSize);
  };

  const handleTableChange = (paginationInfo: any) => {
    const searchParams = searchForm.getFieldsValue();
    loadRooms(searchParams, paginationInfo.current, paginationInfo.pageSize);
  };

  const copyRoomCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode);
    message.success('房间号已复制到剪贴板');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'green';
      case 'ended':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'ended':
        return '已结束';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: '房间名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => (
        <Space>
          <CodeOutlined />
          <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '房间号',
      dataIndex: 'roomCode',
      key: 'roomCode',
      width: 120,
      render: (roomCode: string) => (
        <Space>
          <Tag color="purple">#{roomCode}</Tag>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyRoomCode(roomCode)}
            title="复制房间号"
          />
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (description: string, record: Room) => (
        <Space>
          <Tooltip placement="topLeft" title={description}>
            <span style={{ 
              display: 'inline-block',
              maxWidth: '150px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {description || '-'}
            </span>
          </Tooltip>
          {record.password && <Tag color="orange" icon={<KeyOutlined />}>密码</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '编程语言',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      render: (language: string) => (
        <Tag color="blue">{language}</Tag>
      ),
    },
    {
      title: '创建人',
      key: 'creator',
      width: 100,
      render: (_: any, record: Room) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {record.creator?.username || '-'}
          </span>
        </Space>
      ),
    },
    {
      title: '在线人数',
      key: 'onlineCount',
      width: 100,
      render: (_: any, record: Room) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
            {(record as any).onlineCount || 0}
          </span>
          <span style={{ color: '#999', fontSize: '12px' }}>
            在线
          </span>
        </Space>
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
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Room) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: '房间详情',
                width: 600,
                content: (
                  <div>
                    <p><strong>房间名称:</strong> {record.name}</p>
                    <p><strong>描述:</strong> {record.description || '无'}</p>
                    <p><strong>状态:</strong> {getStatusText(record.status)}</p>
                    <p><strong>编程语言:</strong> {record.language}</p>
                    <p><strong>创建人:</strong> <Tag color="blue">{record.creator?.username || '未知'}</Tag></p>
                    <p><strong>创建时间:</strong> {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
                    <p><strong>在线人数:</strong> <Tag color="green">{(record as any).onlineCount || 0} 人在线</Tag></p>
                    <p><strong>总成员数:</strong> {record.members?.length || 0} 人</p>
                  </div>
                ),
              });
            }}
            title="查看详情"
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="编辑房间"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个房间吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="删除房间"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout title="房间管理">
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16, margin: '0 16px 16px 16px' }} bodyStyle={{ padding: '16px' }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          size="small"
        >
          <Row gutter={[16, 16]} align="bottom" style={{ width: '100%' }}>
            <Col xs={24} sm={12} md={6} lg={5} xl={4}>
              <Form.Item name="name" label="房间名称" style={{ marginBottom: 0 }}>
                <Input placeholder="请输入房间名称" allowClear size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={4}>
              <Form.Item name="roomCode" label="房间号" style={{ marginBottom: 0 }}>
                <Input placeholder="请输入房间号" allowClear size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={3}>
              <Form.Item name="status" label="状态" style={{ marginBottom: 0 }} initialValue="normal">
                <Select placeholder="请选择状态" allowClear size="small" defaultValue="normal">
                  <Option value="normal">正常</Option>
                  <Option value="ended">已结束</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5} xl={4}>
              <Form.Item name="creatorUsername" label="创建人" style={{ marginBottom: 0 }}>
                <Input placeholder="请输入创建人用户名" allowClear size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={5}>
              <Form.Item name="createdAtRange" label="创建时间" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Space size="small">
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="small">
                    搜索
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />} size="small">
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <div style={{ marginBottom: 16, margin: '0 16px 16px 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="small"
        >
          创建房间
        </Button>
      </div>

      <div style={{ overflowX: 'auto', margin: '0 16px' }}>
        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300, y: 'calc(100vh - 400px)' }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            responsive: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          size="middle"
        />
      </div>

      <Modal
        title={editingRoom ? '编辑房间' : '创建房间'}
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
            name="name"
            label="房间名称"
            rules={[{ required: true, message: '请输入房间名称' }]}
          >
            <Input placeholder="输入房间名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="房间描述"
          >
            <TextArea placeholder="输入房间描述（可选）" rows={3} />
          </Form.Item>

          <Form.Item
            name="password"
            label="房间密码"
          >
            <Input.Password placeholder="设置房间密码（可选）" />
          </Form.Item>

          <Form.Item
            name="language"
            label="编程语言"
            rules={[{ required: true, message: '请选择编程语言' }]}
          >
            <Select placeholder="选择编程语言">
              <Option value="javascript">JavaScript</Option>
              <Option value="typescript">TypeScript</Option>
              <Option value="python">Python</Option>
              <Option value="java">Java</Option>
              <Option value="cpp">C++</Option>
              <Option value="csharp">C#</Option>
              <Option value="go">Go</Option>
              <Option value="rust">Rust</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="房间状态"
            initialValue="normal"
            style={{ display: 'none' }}
          >
            <Select>
              <Option value="normal">正常</Option>
              <Option value="ended">已结束</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRoom ? '更新' : '创建'}
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

export default RoomManagement;
