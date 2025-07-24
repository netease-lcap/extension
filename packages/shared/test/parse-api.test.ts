import { expect, test } from 'vitest';
import parseComponentApi from '../src/transforms/parse-component-api';

const apiCode = `
/// <reference types="@nasl/types" />
namespace extensions.vue_library_example.viewComponents {
  const { Component, Prop, ViewComponent, Slot, Method, Param, Event, ViewComponentOptions } = nasl.ui;

  @ExtensionComponent({
    type: 'both',
    ideusage: {
      idetype: 'element',
    }
  })
  @Component({
    title: '二维码查看',
    description: '二维码查看组件，可生成和展示二维码',
  })
  export class QrCode extends ViewComponent {
    constructor(options?: Partial<QrCodeOptions>) {
      super();
    }
  }

  export class QrCodeOptions extends ViewComponentOptions {
    @Prop({
      title: '扫描内容',
      description: '二维码扫描后的文本或链接',
      group: '主要属性',
      setter: {
        concept: 'InputSetter'
      }
    })
    value: nasl.core.String = 'https://example.com';

    @Prop({
      title: '中心图标',
      description: '二维码中心的图片地址',
      group: '主要属性',
      setter: {
        concept: 'ImageSetter'
      }
    })
    icon: nasl.core.String = '';

    @Prop({
      title: '图标大小',
      description: '二维码中心的图片大小',
      group: '主要属性',
      setter: {
        concept: 'EnumSelectSetter',
        options: [{ title: '小' }, { title: '中' }, { title: '大' }]
      }
    })
    iconSize: 'small' | 'medium' | 'large' = 'medium';

    @Prop({
      title: '二维码颜色',
      description: '二维码的颜色，支持十六进制颜色值',
      group: '样式属性',
      setter: {
        concept: 'InputSetter'
      }
    })
    color: nasl.core.String = '#000000';

    @Prop({
      title: '背景颜色',
      description: '二维码的背景颜色，支持十六进制颜色值',
      group: '样式属性',
      setter: {
        concept: 'InputSetter'
      }
    })
    backgroundColor: nasl.core.String = '#FFFFFF';

    @Prop({
      title: '支持放大',
      description: '是否支持点击放大查看二维码',
      group: '交互属性',
      setter: {
        concept: 'SwitchSetter'
      }
    })
    zoomable: nasl.core.Boolean = false;
  }
}
`;

test('parse component api', () => {
  const result = parseComponentApi(apiCode, 'vue2');
  expect(result).toMatchSnapshot();
});

