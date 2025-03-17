import { Modal, Form, Input, Upload } from 'antd';
import styles from './index.module.less';
import { IconAdd } from '../icons';

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FeedbackDialog = ({ open, onClose }: FeedbackDialogProps) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      title={
        <>
          <div>您遇到哪些问题？请吐槽告诉我们~</div>
          <div className={styles.subTitle}>我们将根据您的回答，提供更好的服务</div>
        </>
      }
      width={480}
      className={styles.feedbackDialog}
    >
      <Form layout="vertical">
        <Form.Item label="遇到问题" required name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="问题截图" name="files">
          <Upload listType="picture-card">
            <IconAdd color="#A9AEB8" style={{ width: 24, height: 24 }} />
          </Upload>
        </Form.Item>
        <Form.Item label="所属公司" name="company">
          <Input />
        </Form.Item>
        <Form.Item label="联系方式" name="contact">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FeedbackDialog;