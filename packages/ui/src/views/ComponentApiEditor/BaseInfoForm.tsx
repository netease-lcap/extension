import { useEffect, useContext, useCallback, useRef } from 'react';
import { Button, Form, Input, Radio } from 'antd';
import { pick, omit } from 'lodash';
import { JSONEditorView } from '../../components/JSONEditorView';
import { useComponentContext } from '../../hooks/useComponentContext';
import { IconHelpVariant } from '../../components/icons';
import styles from './index.module.less';
import { ProjectContext } from '../../hooks/useProjectContext';

export interface BaseInfoFormData {
  name?: string;
  title?: string;
  description?: string;
  type?: 'pc' | 'h5' | 'both';
  ideusage?: string;
}

export const BaseInfo = ({ removeSubComponent }: { removeSubComponent: (name: string) => void }) => {
  const [form] = Form.useForm();
  const { openHelpModal } = useContext(ProjectContext);
  const changedRef = useRef<boolean>(false);
  const { component, updateComponent } = useComponentContext();

  useEffect(() => {
    if (component) {
      form.setFieldsValue(pick(component, ['name', 'title', 'description', 'type', 'ideusage']));
    }
  }, [component, form]);

  const handleOpenHelp = useCallback(() => {
    openHelpModal('ComponentIdeUsage');
  }, [openHelpModal]);

  const handleFieldsChange = useCallback(() => {
    changedRef.current = true;
  }, []);

  const handleChange = useCallback(async () => {
    if (!component?.name || !changedRef.current) {
      return;
    }

    await updateComponent({
      type: 'update',
      module: 'info',
      name: component?.name,
      data: omit(form.getFieldsValue(), ['name']),
    });
    changedRef.current = false;
  }, [component?.name, form, updateComponent]);

  return (
   <Form layout="vertical" form={form} onFieldsChange={handleFieldsChange}>
    <Form.Item label="组件名称" required name="name">
      <Input disabled />
    </Form.Item>
    <Form.Item label="组件标题" name="title">
      <Input onBlur={handleChange} />
    </Form.Item>
    <Form.Item label="组件描述" name="description">
      <Input onBlur={handleChange} />
    </Form.Item>
    {
      component && !component.isChild && (
        <Form.Item label="组件端" name="type">
          <Radio.Group onChange={handleChange}>
            <Radio value="pc">PC</Radio>
            <Radio value="h5">H5</Radio>
            <Radio value="both">通用</Radio>
          </Radio.Group>
        </Form.Item>
      )
    }
    <Form.Item required className={styles.ideusageItem} label={
      <div className={styles.ideusageLabel}>
        页面设计器适配
         <Button color="primary" size="small" variant="link" className={styles.helpBtn} onClick={handleOpenHelp}>
          <IconHelpVariant />
          关于页面设计器适配
        </Button>
      </div>
     } name="ideusage">
      <JSONEditorView onBlur={handleChange} />
    </Form.Item>
    {
      component?.isChild && (
        <Button color="danger" block variant="outlined" onClick={() => removeSubComponent(component.name)}>删除子组件</Button>
      )
    }
   </Form>
  );
};

export default BaseInfo;
