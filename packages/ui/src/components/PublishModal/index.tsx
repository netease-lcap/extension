import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { getLcapConfig, getProjectMetaInfo, releaseProject } from '../../services/project';

export interface PublishModalProps {
  open: boolean;
  onClose: () => void;
}

export interface PublishConfig {
  platform?: string;
  username?: string;
  password?: string;
  name?: string;
  title?: string;
  version?: string;
}


export const PublishModal = ({ open, onClose }: PublishModalProps) => {
  const [form] = Form.useForm<PublishConfig>();
  const [publishing, setPublishing] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();


  const handleOk = async () => {
    const values = await form.validateFields();
    setPublishing(true);
    const success = await releaseProject(values);
    if (success) {
      messageApi.success('发布成功');
      onClose();
    }

    setPublishing(false);
  };

  const handleCancel = () => {
    onClose();
  };

  const loadConfig = async () => {
    const [lcapConfig, projectMetaInfo] = await Promise.all([getLcapConfig(), getProjectMetaInfo()]);
    if (!lcapConfig || !projectMetaInfo) {
      return;
    }

    form.setFieldsValue({
      platform: lcapConfig.platform,
      username: lcapConfig.username,
      password: lcapConfig.password,
      name: projectMetaInfo.name,
      title: projectMetaInfo.title,
      version: projectMetaInfo.version,
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    loadConfig();
  }, [open]);

  const versionRules = useMemo(() => [{ required: true, message: '请输入依赖库版本号' }, { pattern: /^\d+\.\d+\.\d+$/, message: '请输入正确的版本号' }], []);

  return (
    <>
      <Modal title="发布到资产中心" open={open} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ style: { minWidth: 60 }, loading: publishing }} cancelButtonProps={{ style: { minWidth: 60 } }}>
        <Form form={form} layout="vertical">
          <Form.Item required={true} rules={[{ required: true, message: '请输入发布平台地址' }]} label="发布平台地址" name="platform">
            <Input />
          </Form.Item>
          <Form.Item required={true} rules={[{ required: true, message: '请输入账号' }]} label="账号" name="username">
            <Input />
          </Form.Item>
          <Form.Item required={true} rules={[{ required: true, message: '请输入密码' }]} label="密码" name="password">
            <Input.Password />
          </Form.Item>
          <Form.Item required={true} rules={[{ required: true, message: '请输入依赖库标识' }]} label="依赖库标识" name="name">
            <Input />
          </Form.Item>
          <Form.Item required={true} rules={[{ required: true, message: '请输入依赖库名称' }]} label="依赖库名称" name="title">
            <Input />
          </Form.Item>
          <Form.Item required={true} rules={versionRules} label="依赖库版本号" name="version">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      {messageContextHolder}
    </>
  );
}
