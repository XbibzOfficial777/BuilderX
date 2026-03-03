import type { WidgetDefinition, DeviceFrame } from '@/types';

export const widgetDefinitions: WidgetDefinition[] = [
  // Basic Widgets
  {
    type: 'Container',
    name: 'Container',
    category: 'basic',
    icon: 'square',
    properties: [
      { key: 'width', label: 'Width', type: 'number', defaultValue: null },
      { key: 'height', label: 'Height', type: 'number', defaultValue: null },
      { key: 'color', label: 'Background Color', type: 'color', defaultValue: '#FFFFFF' },
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: 0 },
      { key: 'margin', label: 'Margin', type: 'size', defaultValue: 0 },
      { key: 'borderRadius', label: 'Border Radius', type: 'number', defaultValue: 0 },
    ],
    defaultValue: { width: null, height: null, color: '#FFFFFF', padding: 0, margin: 0, borderRadius: 0 },
    codeTemplate: `Container(
  {{#width}}width: {{width}},{{/width}}
  {{#height}}height: {{height}},{{/height}}
  padding: EdgeInsets.all({{padding}}),
  decoration: BoxDecoration(
    color: Color({{colorValue}}),
    borderRadius: BorderRadius.circular({{borderRadius}}),
  ),
  child: {{child}},
)`,
  },
  {
    type: 'Text',
    name: 'Text',
    category: 'basic',
    icon: 'type',
    properties: [
      { key: 'text', label: 'Text', type: 'text', defaultValue: 'Text' },
      { key: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 16 },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#000000' },
      { key: 'fontWeight', label: 'Font Weight', type: 'select', defaultValue: 'normal', options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Bold', value: 'bold' },
        { label: 'Light', value: 'light' },
        { label: 'W100', value: 'w100' },
        { label: 'W200', value: 'w200' },
        { label: 'W300', value: 'w300' },
        { label: 'W400', value: 'w400' },
        { label: 'W500', value: 'w500' },
        { label: 'W600', value: 'w600' },
        { label: 'W700', value: 'w700' },
        { label: 'W800', value: 'w800' },
        { label: 'W900', value: 'w900' },
      ]},
      { key: 'textAlign', label: 'Text Align', type: 'select', defaultValue: 'start', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Justify', value: 'justify' },
      ]},
    ],
    defaultValue: { text: 'Text', fontSize: 16, color: '#000000', fontWeight: 'normal', textAlign: 'start' },
    codeTemplate: `Text(
  '{{text}}',
  style: TextStyle(
    fontSize: {{fontSize}},
    color: Color({{colorValue}}),
    fontWeight: {{fontWeightValue}},
  ),
  textAlign: TextAlign.{{textAlign}},
)`,
  },
  {
    type: 'Image',
    name: 'Image',
    category: 'basic',
    icon: 'image',
    properties: [
      { key: 'src', label: 'Image URL', type: 'text', defaultValue: 'https://via.placeholder.com/150' },
      { key: 'width', label: 'Width', type: 'number', defaultValue: 100 },
      { key: 'height', label: 'Height', type: 'number', defaultValue: 100 },
      { key: 'fit', label: 'Fit', type: 'select', defaultValue: 'cover', options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
        { label: 'Fit Width', value: 'fitWidth' },
        { label: 'Fit Height', value: 'fitHeight' },
        { label: 'None', value: 'none' },
      ]},
    ],
    defaultValue: { src: 'https://via.placeholder.com/150', width: 100, height: 100, fit: 'cover' },
    codeTemplate: `Image.network(
  '{{src}}',
  width: {{width}},
  height: {{height}},
  fit: BoxFit.{{fit}},
)`,
  },
  {
    type: 'Icon',
    name: 'Icon',
    category: 'basic',
    icon: 'star',
    properties: [
      { key: 'icon', label: 'Icon Name', type: 'text', defaultValue: 'star' },
      { key: 'size', label: 'Size', type: 'number', defaultValue: 24 },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#000000' },
    ],
    defaultValue: { icon: 'star', size: 24, color: '#000000' },
    codeTemplate: `Icon(
  Icons.{{icon}},
  size: {{size}},
  color: Color({{colorValue}}),
)`,
  },
  
  // Layout Widgets
  {
    type: 'Row',
    name: 'Row',
    category: 'layout',
    icon: 'columns',
    properties: [
      { key: 'mainAxisAlignment', label: 'Main Axis Alignment', type: 'select', defaultValue: 'start', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Space Between', value: 'spaceBetween' },
        { label: 'Space Around', value: 'spaceAround' },
        { label: 'Space Evenly', value: 'spaceEvenly' },
      ]},
      { key: 'crossAxisAlignment', label: 'Cross Axis Alignment', type: 'select', defaultValue: 'center', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Stretch', value: 'stretch' },
        { label: 'Baseline', value: 'baseline' },
      ]},
      { key: 'gap', label: 'Gap', type: 'number', defaultValue: 0 },
    ],
    defaultValue: { mainAxisAlignment: 'start', crossAxisAlignment: 'center', gap: 0 },
    codeTemplate: `Row(
  mainAxisAlignment: MainAxisAlignment.{{mainAxisAlignment}},
  crossAxisAlignment: CrossAxisAlignment.{{crossAxisAlignment}},
  children: {{children}},
)`,
  },
  {
    type: 'Column',
    name: 'Column',
    category: 'layout',
    icon: 'rows',
    properties: [
      { key: 'mainAxisAlignment', label: 'Main Axis Alignment', type: 'select', defaultValue: 'start', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Space Between', value: 'spaceBetween' },
        { label: 'Space Around', value: 'spaceAround' },
        { label: 'Space Evenly', value: 'spaceEvenly' },
      ]},
      { key: 'crossAxisAlignment', label: 'Cross Axis Alignment', type: 'select', defaultValue: 'center', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Stretch', value: 'stretch' },
        { label: 'Baseline', value: 'baseline' },
      ]},
      { key: 'gap', label: 'Gap', type: 'number', defaultValue: 0 },
    ],
    defaultValue: { mainAxisAlignment: 'start', crossAxisAlignment: 'center', gap: 0 },
    codeTemplate: `Column(
  mainAxisAlignment: MainAxisAlignment.{{mainAxisAlignment}},
  crossAxisAlignment: CrossAxisAlignment.{{crossAxisAlignment}},
  children: {{children}},
)`,
  },
  {
    type: 'Stack',
    name: 'Stack',
    category: 'layout',
    icon: 'layers',
    properties: [
      { key: 'alignment', label: 'Alignment', type: 'select', defaultValue: 'topStart', options: [
        { label: 'Top Start', value: 'topStart' },
        { label: 'Top Center', value: 'topCenter' },
        { label: 'Top End', value: 'topEnd' },
        { label: 'Center Start', value: 'centerStart' },
        { label: 'Center', value: 'center' },
        { label: 'Center End', value: 'centerEnd' },
        { label: 'Bottom Start', value: 'bottomStart' },
        { label: 'Bottom Center', value: 'bottomCenter' },
        { label: 'Bottom End', value: 'bottomEnd' },
      ]},
    ],
    defaultValue: { alignment: 'topStart' },
    codeTemplate: `Stack(
  alignment: Alignment.{{alignment}},
  children: {{children}},
)`,
  },
  {
    type: 'Expanded',
    name: 'Expanded',
    category: 'layout',
    icon: 'maximize',
    properties: [
      { key: 'flex', label: 'Flex', type: 'number', defaultValue: 1 },
    ],
    defaultValue: { flex: 1 },
    codeTemplate: `Expanded(
  flex: {{flex}},
  child: {{child}},
)`,
  },
  {
    type: 'ListView',
    name: 'ListView',
    category: 'layout',
    icon: 'list',
    properties: [
      { key: 'scrollDirection', label: 'Scroll Direction', type: 'select', defaultValue: 'vertical', options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
      ]},
      { key: 'padding', label: 'Padding', type: 'size', defaultValue: 0 },
    ],
    defaultValue: { scrollDirection: 'vertical', padding: 0 },
    codeTemplate: `ListView(
  scrollDirection: Axis.{{scrollDirection}},
  padding: EdgeInsets.all({{padding}}),
  children: {{children}},
)`,
  },
  {
    type: 'GridView',
    name: 'GridView',
    category: 'layout',
    icon: 'grid',
    properties: [
      { key: 'crossAxisCount', label: 'Cross Axis Count', type: 'number', defaultValue: 2 },
      { key: 'mainAxisSpacing', label: 'Main Axis Spacing', type: 'number', defaultValue: 10 },
      { key: 'crossAxisSpacing', label: 'Cross Axis Spacing', type: 'number', defaultValue: 10 },
    ],
    defaultValue: { crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10 },
    codeTemplate: `GridView.count(
  crossAxisCount: {{crossAxisCount}},
  mainAxisSpacing: {{mainAxisSpacing}},
  crossAxisSpacing: {{crossAxisSpacing}},
  children: {{children}},
)`,
  },
  {
    type: 'Wrap',
    name: 'Wrap',
    category: 'layout',
    icon: 'wrap',
    properties: [
      { key: 'direction', label: 'Direction', type: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ]},
      { key: 'spacing', label: 'Spacing', type: 'number', defaultValue: 10 },
      { key: 'runSpacing', label: 'Run Spacing', type: 'number', defaultValue: 10 },
    ],
    defaultValue: { direction: 'horizontal', spacing: 10, runSpacing: 10 },
    codeTemplate: `Wrap(
  direction: Axis.{{direction}},
  spacing: {{spacing}},
  runSpacing: {{runSpacing}},
  children: {{children}},
)`,
  },
  
  // Input Widgets
  {
    type: 'TextField',
    name: 'TextField',
    category: 'input',
    icon: 'text-cursor-input',
    properties: [
      { key: 'label', label: 'Label', type: 'text', defaultValue: 'Enter text' },
      { key: 'hintText', label: 'Hint Text', type: 'text', defaultValue: '' },
      { key: 'obscureText', label: 'Obscure Text', type: 'boolean', defaultValue: false },
    ],
    defaultValue: { label: 'Enter text', hintText: '', obscureText: false },
    codeTemplate: `TextField(
  decoration: InputDecoration(
    labelText: '{{label}}',
    hintText: '{{hintText}}',
  ),
  obscureText: {{obscureText}},
)`,
  },
  {
    type: 'Checkbox',
    name: 'Checkbox',
    category: 'input',
    icon: 'check-square',
    properties: [
      { key: 'value', label: 'Checked', type: 'boolean', defaultValue: false },
      { key: 'label', label: 'Label', type: 'text', defaultValue: 'Checkbox' },
    ],
    defaultValue: { value: false, label: 'Checkbox' },
    codeTemplate: `Checkbox(
  value: {{value}},
  onChanged: (bool? value) {},
)`,
  },
  {
    type: 'Switch',
    name: 'Switch',
    category: 'input',
    icon: 'toggle-left',
    properties: [
      { key: 'value', label: 'On', type: 'boolean', defaultValue: false },
      { key: 'label', label: 'Label', type: 'text', defaultValue: 'Switch' },
    ],
    defaultValue: { value: false, label: 'Switch' },
    codeTemplate: `Switch(
  value: {{value}},
  onChanged: (bool value) {},
)`,
  },
  {
    type: 'Slider',
    name: 'Slider',
    category: 'input',
    icon: 'sliders',
    properties: [
      { key: 'min', label: 'Min', type: 'number', defaultValue: 0 },
      { key: 'max', label: 'Max', type: 'number', defaultValue: 100 },
      { key: 'value', label: 'Value', type: 'number', defaultValue: 50 },
    ],
    defaultValue: { min: 0, max: 100, value: 50 },
    codeTemplate: `Slider(
  min: {{min}},
  max: {{max}},
  value: {{value}},
  onChanged: (double value) {},
)`,
  },
  {
    type: 'DropdownButton',
    name: 'DropdownButton',
    category: 'input',
    icon: 'chevron-down',
    properties: [
      { key: 'items', label: 'Items (comma separated)', type: 'text', defaultValue: 'Option 1,Option 2,Option 3' },
    ],
    defaultValue: { items: 'Option 1,Option 2,Option 3' },
    codeTemplate: `DropdownButton<String>(
  items: [{{itemsArray}}].map((String value) {
    return DropdownMenuItem<String>(
      value: value,
      child: Text(value),
    );
  }).toList(),
  onChanged: (String? value) {},
)`,
  },
  
  // Button Widgets
  {
    type: 'ElevatedButton',
    name: 'Elevated Button',
    category: 'button',
    icon: 'mouse-pointer-click',
    properties: [
      { key: 'label', label: 'Label', type: 'text', defaultValue: 'Button' },
      { key: 'color', label: 'Background Color', type: 'color', defaultValue: '#2196F3' },
    ],
    defaultValue: { label: 'Button', color: '#2196F3' },
    codeTemplate: `ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: Color({{colorValue}}),
  ),
  child: Text('{{label}}'),
)`,
  },
  {
    type: 'OutlinedButton',
    name: 'Outlined Button',
    category: 'button',
    icon: 'square',
    properties: [
      { key: 'label', label: 'Label', type: 'text', defaultValue: 'Button' },
      { key: 'color', label: 'Border Color', type: 'color', defaultValue: '#2196F3' },
    ],
    defaultValue: { label: 'Button', color: '#2196F3' },
    codeTemplate: `OutlinedButton(
  onPressed: () {},
  style: OutlinedButton.styleFrom(
    foregroundColor: Color({{colorValue}}),
  ),
  child: Text('{{label}}'),
)`,
  },
  {
    type: 'TextButton',
    name: 'Text Button',
    category: 'button',
    icon: 'text',
    properties: [
      { key: 'label', label: 'Label', type: 'text', defaultValue: 'Button' },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#2196F3' },
    ],
    defaultValue: { label: 'Button', color: '#2196F3' },
    codeTemplate: `TextButton(
  onPressed: () {},
  style: TextButton.styleFrom(
    foregroundColor: Color({{colorValue}}),
  ),
  child: Text('{{label}}'),
)`,
  },
  {
    type: 'FloatingActionButton',
    name: 'Floating Action Button',
    category: 'button',
    icon: 'plus-circle',
    properties: [
      { key: 'icon', label: 'Icon', type: 'text', defaultValue: 'add' },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#2196F3' },
    ],
    defaultValue: { icon: 'add', color: '#2196F3' },
    codeTemplate: `FloatingActionButton(
  onPressed: () {},
  backgroundColor: Color({{colorValue}}),
  child: Icon(Icons.{{icon}}),
)`,
  },
  {
    type: 'IconButton',
    name: 'Icon Button',
    category: 'button',
    icon: 'mouse-pointer',
    properties: [
      { key: 'icon', label: 'Icon', type: 'text', defaultValue: 'favorite' },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#FF0000' },
      { key: 'size', label: 'Size', type: 'number', defaultValue: 24 },
    ],
    defaultValue: { icon: 'favorite', color: '#FF0000', size: 24 },
    codeTemplate: `IconButton(
  onPressed: () {},
  icon: Icon(Icons.{{icon}}),
  color: Color({{colorValue}}),
  iconSize: {{size}},
)`,
  },
  
  // Display Widgets
  {
    type: 'Card',
    name: 'Card',
    category: 'display',
    icon: 'credit-card',
    properties: [
      { key: 'elevation', label: 'Elevation', type: 'number', defaultValue: 4 },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#FFFFFF' },
      { key: 'borderRadius', label: 'Border Radius', type: 'number', defaultValue: 8 },
    ],
    defaultValue: { elevation: 4, color: '#FFFFFF', borderRadius: 8 },
    codeTemplate: `Card(
  elevation: {{elevation}},
  color: Color({{colorValue}}),
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular({{borderRadius}}),
  ),
  child: {{child}},
)`,
  },
  {
    type: 'CircularProgressIndicator',
    name: 'Circular Progress',
    category: 'display',
    icon: 'loader',
    properties: [
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#2196F3' },
      { key: 'strokeWidth', label: 'Stroke Width', type: 'number', defaultValue: 4 },
    ],
    defaultValue: { color: '#2196F3', strokeWidth: 4 },
    codeTemplate: `CircularProgressIndicator(
  color: Color({{colorValue}}),
  strokeWidth: {{strokeWidth}},
)`,
  },
  {
    type: 'LinearProgressIndicator',
    name: 'Linear Progress',
    category: 'display',
    icon: 'minus',
    properties: [
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#2196F3' },
      { key: 'value', label: 'Value (0-1)', type: 'number', defaultValue: 0.5 },
    ],
    defaultValue: { color: '#2196F3', value: 0.5 },
    codeTemplate: `LinearProgressIndicator(
  color: Color({{colorValue}}),
  value: {{value}},
)`,
  },
  {
    type: 'Divider',
    name: 'Divider',
    category: 'display',
    icon: 'minus',
    properties: [
      { key: 'thickness', label: 'Thickness', type: 'number', defaultValue: 1 },
      { key: 'color', label: 'Color', type: 'color', defaultValue: '#CCCCCC' },
    ],
    defaultValue: { thickness: 1, color: '#CCCCCC' },
    codeTemplate: `Divider(
  thickness: {{thickness}},
  color: Color({{colorValue}}),
)`,
  },
  {
    type: 'SizedBox',
    name: 'SizedBox',
    category: 'layout',
    icon: 'square',
    properties: [
      { key: 'width', label: 'Width', type: 'number', defaultValue: null },
      { key: 'height', label: 'Height', type: 'number', defaultValue: null },
    ],
    defaultValue: { width: null, height: null },
    codeTemplate: `SizedBox(
  {{#width}}width: {{width}},{{/width}}
  {{#height}}height: {{height}},{{/height}}
)`,
  },
  
  // Navigation Widgets
  {
    type: 'AppBar',
    name: 'AppBar',
    category: 'navigation',
    icon: 'panel-top',
    properties: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: 'AppBar' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#2196F3' },
      { key: 'centerTitle', label: 'Center Title', type: 'boolean', defaultValue: false },
    ],
    defaultValue: { title: 'AppBar', backgroundColor: '#2196F3', centerTitle: false },
    codeTemplate: `AppBar(
  title: Text('{{title}}'),
  backgroundColor: Color({{colorValue}}),
  centerTitle: {{centerTitle}},
)`,
  },
  {
    type: 'BottomNavigationBar',
    name: 'Bottom Navigation',
    category: 'navigation',
    icon: 'panel-bottom',
    properties: [
      { key: 'items', label: 'Items (comma separated)', type: 'text', defaultValue: 'Home,Search,Profile' },
      { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#FFFFFF' },
    ],
    defaultValue: { items: 'Home,Search,Profile', backgroundColor: '#FFFFFF' },
    codeTemplate: `BottomNavigationBar(
  items: [
    {{navItems}}
  ],
  backgroundColor: Color({{colorValue}}),
)`,
  },
  {
    type: 'TabBar',
    name: 'TabBar',
    category: 'navigation',
    icon: 'layout-tabs',
    properties: [
      { key: 'tabs', label: 'Tabs (comma separated)', type: 'text', defaultValue: 'Tab 1,Tab 2,Tab 3' },
    ],
    defaultValue: { tabs: 'Tab 1,Tab 2,Tab 3' },
    codeTemplate: `TabBar(
  tabs: [
    {{tabItems}}
  ],
)`,
  },
  {
    type: 'Drawer',
    name: 'Drawer',
    category: 'navigation',
    icon: 'panel-left',
    properties: [
      { key: 'width', label: 'Width', type: 'number', defaultValue: 250 },
    ],
    defaultValue: { width: 250 },
    codeTemplate: `Drawer(
  child: {{child}},
)`,
  },
];

export const widgetCategories = [
  { id: 'basic', name: 'Basic', icon: 'box' },
  { id: 'layout', name: 'Layout', icon: 'layout' },
  { id: 'input', name: 'Input', icon: 'input' },
  { id: 'display', name: 'Display', icon: 'display' },
  { id: 'button', name: 'Buttons', icon: 'mouse-pointer' },
  { id: 'navigation', name: 'Navigation', icon: 'navigation' },
];

export const deviceFrames: DeviceFrame[] = [
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844, type: 'phone', os: 'ios' },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'phone', os: 'ios' },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, type: 'phone', os: 'ios' },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, type: 'phone', os: 'android' },
  { id: 'pixel-7-pro', name: 'Pixel 7 Pro', width: 412, height: 892, type: 'phone', os: 'android' },
  { id: 'samsung-s23', name: 'Samsung S23', width: 360, height: 780, type: 'phone', os: 'android' },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, type: 'tablet', os: 'ios' },
  { id: 'ipad-pro-12', name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet', os: 'ios' },
  { id: 'pixel-tablet', name: 'Pixel Tablet', width: 820, height: 1184, type: 'tablet', os: 'android' },
  { id: 'galaxy-tab-s8', name: 'Galaxy Tab S8', width: 800, height: 1280, type: 'tablet', os: 'android' },
];

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return widgetDefinitions.find(w => w.type === type);
}

export function getWidgetsByCategory(category: string): WidgetDefinition[] {
  return widgetDefinitions.filter(w => w.category === category);
}

export function hexToColorValue(hex: string): string {
  const hexValue = hex.replace('#', '');
  return `0xFF${hexValue.toUpperCase()}`;
}
