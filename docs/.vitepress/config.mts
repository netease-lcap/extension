import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: "CodeWave 扩展开发",
  base: '/extension/',
  description: "前端依赖库是指开发者自行开发或引入的组件、逻辑，用于满足定制化需求和功能扩展。这些库可被用于自定义界面样式、交互效果、组件功能，或者整合特定的第三方服务（例如微信SDK、钉钉SDK），并且能够被导入到IDE平台中供开发使用）",
  head: [
    ['link', { ref: 'shortcut icon', type: 'image/x-icon', href: 'logo.png?' }],
    ['meta', { 'http-equiv': 'Cross-Origin-Resource-Policy', content: 'cross-origin' }],
  ],
  themeConfig: {
    logo: '/logo.png',
    search: {
      provider: 'local',
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '开发指南', link: '/frontend/introduction.md' },
      // { text: '示例', link: '/examples/element-ui/index.md' }
    ],

    sidebar: {
      '/frontend/': [{
        text: '简介',
        items: [
          { text: '概述', link: '/frontend/introduction.md' },
          {
            text: '快速开始',
            link: '/frontend/get-started/environment.md',
            collapsed: true,
            items: [{
              text: '环境准备',
              link: '/frontend/get-started/environment.md',
            },
            {
              text: '创建依赖库',
              link: '/frontend/get-started/init.md',
            },
            {
              text: '发布与使用',
              link: '/frontend/get-started/usage.md'
            },
            {
              text: 'IDE 内调试依赖库',
              link: '/frontend/get-started/debug.md'
            }],
          },
        ],
      }, {
        text: '组件接入',
        items: [
          { text: '开发指南', link: '/frontend/component/index.md' },
          { text: '组件配置（api.ts）描述编写', link: '/frontend/component/api.md' },
          {
            text: '页面编辑适配说明',
            collapsed: false,
            items: [
              { text: '页面设计器适配说明', link: '/frontend/component/ide/index.md' },
              { text: 'element配置说明', link: '/frontend/component/ide/element.md' },
              { text: 'container说明', link: '/frontend/component/ide/container.md' },
              { text: 'modal&drawer&messager配置说明', link: '/frontend/component/ide/modal.md' },
              { text: 'popover说明', link: '/frontend/component/ide/popover.md' },
              { text: '表达式API说明与示例', link: '/frontend/component/ide/expression.md' },
            ]
          },
          { text: '区块示例', link: '/frontend/component/block.md' },
          {
            text: '平台能力适配',
            collapsed: false,
            items: [
              { text: '图标设置', link: '/frontend/component/platform/icon-setter.md' },
              { text: '链接跳转', link: '/frontend/component/platform/link.md' },
              { text: '函数属性', link: '/frontend/component/platform/function.md' },
              { text: '事件转换', link: '/frontend/component/platform/event.md' },
              { text: '数据源', link: '/frontend/component/platform/data-source.md' },
              { text: '插槽处理', link: '/frontend/component/platform/slot.md' },
              { text: '父组件和子组件', link: '/frontend/component/platform/child.md' },
              { text: '表单组件能力适配', link: '/frontend/component/platform/form.md' },
              { text: '可访问属性', link: '/frontend/component/platform/accessibility.md' },
            ]
          },
          {
            text: 'IDE 能力适配',
            collapsed: false,
            items: [
              { text: '主题编辑', link: '/frontend/component/theme.md' },
              { text: '国际化', link: '/frontend/component/i18n.md' },
              { text: '图标库扩展', link: '/frontend/component/icon.md' },
              { text: '实体自动化行为', link: '/frontend/component/nasl-generate.md' },
            ],
          },
          { text: 'View Component API 书写指南和规范', link: '/frontend/component/nasl-view-component.md' },
        ],
      }, {
        text: '基础组件二次开发',
        items: [
          { text: '开发指南', link: '/frontend/extend/index.md' },
          { text: 'FAQ', link: '/frontend/extend/faq.md' },
        ]
      }, {
        text: '前端逻辑扩展',
        items: [
          { text: '开发指南', link: '/frontend/logic/index.md' }
        ],
      }],
      '/backend/': [{
        text: '简介',
        items: [
          { text: '概述', link: '/backend/introduction.md' },
          { text: '快速开始', link: '/backend/get-started.md' },
        ],
      }],
      '/examples/': [{
        text: 'Element UI 接入示例',
        items: [
          { text: '概述', link: '/examples/element-ui/index.md' },
          { text: 'Table 表格', link: '/examples/element-ui/table.md' },
          { text: 'DatePicker 日期选择器', link: '/examples/element-ui/date-picker.md' },
          { text: 'Select 选择器', link: '/examples/element-ui/select.md' },
          { text: 'Cascder 级联选择器', link: '/examples/element-ui/cascader.md' },
          { text: 'Dialog 对话框', link: '/examples/element-ui/dialog.md' },
          { text: 'Tabs 选项卡', link: '/examples/element-ui/tabs.md' },
        ],
      }]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/netease-lcap/extension' }
    ],
    footer: {
      message: '',
      copyright: '版权所有 © 2024-present CodeWave develop team'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },
    editLink: {
      pattern: 'https://github.com/netease-lcap/extension/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },
  lastUpdated: true,
})
