import type { WidgetDefinition, WidgetCategory } from '@/types/widget';

export const widgetCategories: { id: WidgetCategory; name: string; icon: string }[] = [
  { id: 'basic', name: 'Basic', icon: 'Box' },
  { id: 'layout', name: 'Layout', icon: 'LayoutGrid' },
  { id: 'input', name: 'Input', icon: 'TextCursor' },
  { id: 'display', name: 'Display', icon: 'Monitor' },
  { id: 'navigation', name: 'Navigation', icon: 'Navigation' },
  { id: 'effects', name: 'Effects', icon: 'Sparkles' },
];

export const widgetDefinitions: WidgetDefinition[] = [
  // Basic Widgets
  {
    type: 'Container',
    category: 'basic',
    displayName: 'Container',
    icon: 'Box',
    description: 'A convenience widget that combines common painting, positioning, and sizing widgets.',
    canHaveChildren: true,
    properties: [
      { name: 'width', type: 'double', defaultValue: 100, label: 'Width' },
      { name: 'height', type: 'double', defaultValue: 100, label: 'Height' },
      { name: 'color', type: 'color', defaultValue: '#7B6DFF', label: 'Background Color' },
      { name: 'borderRadius', type: 'double', defaultValue: 8, label: 'Border Radius' },
      { name: 'padding', type: 'edgeInsets', defaultValue: { top: 0, right: 0, bottom: 0, left: 0 }, label: 'Padding' },
      { name: 'margin', type: 'edgeInsets', defaultValue: { top: 0, right: 0, bottom: 0, left: 0 }, label: 'Margin' },
    ],
  },
  {
    type: 'Text',
    category: 'basic',
    displayName: 'Text',
    icon: 'Type',
    description: 'A run of styled text.',
    canHaveChildren: false,
    properties: [
      { name: 'data', type: 'string', defaultValue: 'Hello Flutter', label: 'Text' },
      { name: 'fontSize', type: 'double', defaultValue: 16, label: 'Font Size' },
      { name: 'color', type: 'color', defaultValue: '#F2F4F8', label: 'Color' },
      { name: 'fontWeight', type: 'enum', defaultValue: 'normal', options: ['normal', 'bold', 'w100', 'w200', 'w300', 'w400', 'w500', 'w600', 'w700', 'w800', 'w900'], label: 'Font Weight' },
      { name: 'textAlign', type: 'enum', defaultValue: 'left', options: ['left', 'center', 'right', 'justify', 'start', 'end'], label: 'Text Align' },
    ],
  },
  {
    type: 'Icon',
    category: 'basic',
    displayName: 'Icon',
    icon: 'Icons',
    description: 'A Material Design icon.',
    canHaveChildren: false,
    properties: [
      { name: 'icon', type: 'enum', defaultValue: 'favorite', options: ['favorite', 'home', 'settings', 'person', 'search', 'add', 'close', 'check', 'arrow_back', 'arrow_forward', 'menu', 'more_vert', 'notifications', 'shopping_cart', 'star'], label: 'Icon' },
      { name: 'size', type: 'double', defaultValue: 24, label: 'Size' },
      { name: 'color', type: 'color', defaultValue: '#7B6DFF', label: 'Color' },
    ],
  },
  {
    type: 'Image',
    category: 'basic',
    displayName: 'Image',
    icon: 'Image',
    description: 'A widget that displays an image.',
    canHaveChildren: false,
    properties: [
      { name: 'url', type: 'string', defaultValue: 'https://picsum.photos/200', label: 'Image URL' },
      { name: 'width', type: 'double', defaultValue: 200, label: 'Width' },
      { name: 'height', type: 'double', defaultValue: 200, label: 'Height' },
      { name: 'fit', type: 'enum', defaultValue: 'cover', options: ['cover', 'contain', 'fill', 'fitWidth', 'fitHeight', 'none', 'scaleDown'], label: 'Fit' },
      { name: 'borderRadius', type: 'double', defaultValue: 0, label: 'Border Radius' },
    ],
  },

  // Layout Widgets
  {
    type: 'Row',
    category: 'layout',
    displayName: 'Row',
    icon: 'AlignHorizontalJustifyStart',
    description: 'A widget that displays its children in a horizontal array.',
    canHaveChildren: true,
    properties: [
      { name: 'mainAxisAlignment', type: 'enum', defaultValue: 'start', options: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'], label: 'Main Axis Alignment' },
      { name: 'crossAxisAlignment', type: 'enum', defaultValue: 'center', options: ['start', 'end', 'center', 'stretch', 'baseline'], label: 'Cross Axis Alignment' },
      { name: 'mainAxisSize', type: 'enum', defaultValue: 'max', options: ['min', 'max'], label: 'Main Axis Size' },
    ],
  },
  {
    type: 'Column',
    category: 'layout',
    displayName: 'Column',
    icon: 'AlignVerticalJustifyStart',
    description: 'A widget that displays its children in a vertical array.',
    canHaveChildren: true,
    properties: [
      { name: 'mainAxisAlignment', type: 'enum', defaultValue: 'start', options: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'], label: 'Main Axis Alignment' },
      { name: 'crossAxisAlignment', type: 'enum', defaultValue: 'center', options: ['start', 'end', 'center', 'stretch', 'baseline'], label: 'Cross Axis Alignment' },
      { name: 'mainAxisSize', type: 'enum', defaultValue: 'max', options: ['min', 'max'], label: 'Main Axis Size' },
    ],
  },
  {
    type: 'Stack',
    category: 'layout',
    displayName: 'Stack',
    icon: 'Layers',
    description: 'A widget that positions its children relative to the edges of its box.',
    canHaveChildren: true,
    properties: [
      { name: 'alignment', type: 'alignment', defaultValue: 'topLeft', label: 'Alignment' },
      { name: 'fit', type: 'enum', defaultValue: 'loose', options: ['loose', 'expand', 'passthrough'], label: 'Fit' },
    ],
  },
  {
    type: 'Center',
    category: 'layout',
    displayName: 'Center',
    icon: 'AlignCenter',
    description: 'A widget that centers its child within itself.',
    canHaveChildren: true,
    properties: [
      { name: 'widthFactor', type: 'double', defaultValue: null, label: 'Width Factor' },
      { name: 'heightFactor', type: 'double', defaultValue: null, label: 'Height Factor' },
    ],
  },
  {
    type: 'Padding',
    category: 'layout',
    displayName: 'Padding',
    icon: 'Move',
    description: 'A widget that insets its child by the given padding.',
    canHaveChildren: true,
    properties: [
      { name: 'padding', type: 'edgeInsets', defaultValue: { top: 16, right: 16, bottom: 16, left: 16 }, label: 'Padding' },
    ],
  },
  {
    type: 'Expanded',
    category: 'layout',
    displayName: 'Expanded',
    icon: 'Maximize2',
    description: 'A widget that expands a child of a Row, Column, or Flex.',
    canHaveChildren: true,
    properties: [
      { name: 'flex', type: 'number', defaultValue: 1, label: 'Flex' },
    ],
  },
  {
    type: 'SizedBox',
    category: 'layout',
    displayName: 'SizedBox',
    icon: 'Square',
    description: 'A box with a specified size.',
    canHaveChildren: true,
    properties: [
      { name: 'width', type: 'double', defaultValue: 100, label: 'Width' },
      { name: 'height', type: 'double', defaultValue: 100, label: 'Height' },
    ],
  },

  // Input Widgets
  {
    type: 'TextField',
    category: 'input',
    displayName: 'Text Field',
    icon: 'TextCursor',
    description: 'A material design text field.',
    canHaveChildren: false,
    properties: [
      { name: 'hintText', type: 'string', defaultValue: 'Enter text', label: 'Hint Text' },
      { name: 'labelText', type: 'string', defaultValue: '', label: 'Label Text' },
      { name: 'obscureText', type: 'boolean', defaultValue: false, label: 'Obscure Text' },
      { name: 'maxLines', type: 'number', defaultValue: 1, label: 'Max Lines' },
      { name: 'borderRadius', type: 'double', defaultValue: 8, label: 'Border Radius' },
    ],
  },
  {
    type: 'ElevatedButton',
    category: 'input',
    displayName: 'Elevated Button',
    icon: 'MousePointerClick',
    description: 'A Material Design elevated button.',
    canHaveChildren: true,
    properties: [
      { name: 'backgroundColor', type: 'color', defaultValue: '#7B6DFF', label: 'Background Color' },
      { name: 'foregroundColor', type: 'color', defaultValue: '#FFFFFF', label: 'Foreground Color' },
      { name: 'borderRadius', type: 'double', defaultValue: 8, label: 'Border Radius' },
      { name: 'elevation', type: 'double', defaultValue: 2, label: 'Elevation' },
    ],
  },
  {
    type: 'TextButton',
    category: 'input',
    displayName: 'Text Button',
    icon: 'Type',
    description: 'A Material Design text button.',
    canHaveChildren: true,
    properties: [
      { name: 'foregroundColor', type: 'color', defaultValue: '#7B6DFF', label: 'Foreground Color' },
    ],
  },
  {
    type: 'IconButton',
    category: 'input',
    displayName: 'Icon Button',
    icon: 'CircleDot',
    description: 'A Material Design icon button.',
    canHaveChildren: false,
    properties: [
      { name: 'icon', type: 'enum', defaultValue: 'favorite', options: ['favorite', 'home', 'settings', 'person', 'search', 'add', 'close', 'check', 'arrow_back', 'arrow_forward', 'menu'], label: 'Icon' },
      { name: 'iconSize', type: 'double', defaultValue: 24, label: 'Icon Size' },
      { name: 'color', type: 'color', defaultValue: '#7B6DFF', label: 'Color' },
    ],
  },
  {
    type: 'Checkbox',
    category: 'input',
    displayName: 'Checkbox',
    icon: 'CheckSquare',
    description: 'A Material Design checkbox.',
    canHaveChildren: false,
    properties: [
      { name: 'value', type: 'boolean', defaultValue: false, label: 'Checked' },
      { name: 'activeColor', type: 'color', defaultValue: '#7B6DFF', label: 'Active Color' },
    ],
  },
  {
    type: 'Switch',
    category: 'input',
    displayName: 'Switch',
    icon: 'ToggleLeft',
    description: 'A Material Design switch.',
    canHaveChildren: false,
    properties: [
      { name: 'value', type: 'boolean', defaultValue: false, label: 'On' },
      { name: 'activeColor', type: 'color', defaultValue: '#7B6DFF', label: 'Active Color' },
    ],
  },
  {
    type: 'Slider',
    category: 'input',
    displayName: 'Slider',
    icon: 'SlidersHorizontal',
    description: 'A Material Design slider.',
    canHaveChildren: false,
    properties: [
      { name: 'value', type: 'double', defaultValue: 0.5, label: 'Value' },
      { name: 'min', type: 'double', defaultValue: 0, label: 'Min' },
      { name: 'max', type: 'double', defaultValue: 1, label: 'Max' },
      { name: 'activeColor', type: 'color', defaultValue: '#7B6DFF', label: 'Active Color' },
    ],
  },

  // Display Widgets
  {
    type: 'Card',
    category: 'display',
    displayName: 'Card',
    icon: 'CreditCard',
    description: 'A Material Design card.',
    canHaveChildren: true,
    properties: [
      { name: 'color', type: 'color', defaultValue: '#1E1E2E', label: 'Color' },
      { name: 'borderRadius', type: 'double', defaultValue: 12, label: 'Border Radius' },
      { name: 'elevation', type: 'double', defaultValue: 2, label: 'Elevation' },
      { name: 'margin', type: 'edgeInsets', defaultValue: { top: 8, right: 8, bottom: 8, left: 8 }, label: 'Margin' },
    ],
  },
  {
    type: 'ListTile',
    category: 'display',
    displayName: 'List Tile',
    icon: 'List',
    description: 'A single fixed-height row.',
    canHaveChildren: false,
    properties: [
      { name: 'title', type: 'string', defaultValue: 'Title', label: 'Title' },
      { name: 'subtitle', type: 'string', defaultValue: 'Subtitle', label: 'Subtitle' },
      { name: 'leadingIcon', type: 'enum', defaultValue: 'person', options: ['none', 'person', 'home', 'settings', 'favorite', 'search', 'notifications'], label: 'Leading Icon' },
      { name: 'trailingIcon', type: 'enum', defaultValue: 'arrow_forward', options: ['none', 'arrow_forward', 'check', 'close', 'more_vert'], label: 'Trailing Icon' },
    ],
  },
  {
    type: 'Chip',
    category: 'display',
    displayName: 'Chip',
    icon: 'Tag',
    description: 'A Material Design chip.',
    canHaveChildren: false,
    properties: [
      { name: 'label', type: 'string', defaultValue: 'Chip', label: 'Label' },
      { name: 'backgroundColor', type: 'color', defaultValue: '#2D2D3D', label: 'Background Color' },
      { name: 'labelColor', type: 'color', defaultValue: '#F2F4F8', label: 'Label Color' },
      { name: 'avatar', type: 'enum', defaultValue: 'none', options: ['none', 'circle'], label: 'Avatar' },
    ],
  },
  {
    type: 'Badge',
    category: 'display',
    displayName: 'Badge',
    icon: 'Badge',
    description: 'A Material Design badge.',
    canHaveChildren: true,
    properties: [
      { name: 'label', type: 'string', defaultValue: '3', label: 'Label' },
      { name: 'backgroundColor', type: 'color', defaultValue: '#FF2E8C', label: 'Background Color' },
      { name: 'textColor', type: 'color', defaultValue: '#FFFFFF', label: 'Text Color' },
    ],
  },
  {
    type: 'CircularProgressIndicator',
    category: 'display',
    displayName: 'Circular Progress',
    icon: 'Loader2',
    description: 'A Material Design circular progress indicator.',
    canHaveChildren: false,
    properties: [
      { name: 'value', type: 'double', defaultValue: null, label: 'Progress (null for indeterminate)' },
      { name: 'color', type: 'color', defaultValue: '#7B6DFF', label: 'Color' },
      { name: 'strokeWidth', type: 'double', defaultValue: 4, label: 'Stroke Width' },
    ],
  },
  {
    type: 'LinearProgressIndicator',
    category: 'display',
    displayName: 'Linear Progress',
    icon: 'Minus',
    description: 'A Material Design linear progress indicator.',
    canHaveChildren: false,
    properties: [
      { name: 'value', type: 'double', defaultValue: 0.5, label: 'Progress' },
      { name: 'backgroundColor', type: 'color', defaultValue: '#2D2D3D', label: 'Background Color' },
      { name: 'valueColor', type: 'color', defaultValue: '#7B6DFF', label: 'Value Color' },
      { name: 'minHeight', type: 'double', defaultValue: 4, label: 'Min Height' },
    ],
  },
  {
    type: 'Divider',
    category: 'display',
    displayName: 'Divider',
    icon: 'Minus',
    description: 'A one logical pixel thick horizontal line.',
    canHaveChildren: false,
    properties: [
      { name: 'color', type: 'color', defaultValue: '#3D3D4D', label: 'Color' },
      { name: 'thickness', type: 'double', defaultValue: 1, label: 'Thickness' },
      { name: 'indent', type: 'double', defaultValue: 0, label: 'Indent' },
      { name: 'endIndent', type: 'double', defaultValue: 0, label: 'End Indent' },
    ],
  },

  // Navigation Widgets
  {
    type: 'AppBar',
    category: 'navigation',
    displayName: 'App Bar',
    icon: 'PanelTop',
    description: 'A Material Design app bar.',
    canHaveChildren: true,
    properties: [
      { name: 'title', type: 'string', defaultValue: 'App Bar', label: 'Title' },
      { name: 'backgroundColor', type: 'color', defaultValue: '#1E1E2E', label: 'Background Color' },
      { name: 'foregroundColor', type: 'color', defaultValue: '#F2F4F8', label: 'Foreground Color' },
      { name: 'elevation', type: 'double', defaultValue: 4, label: 'Elevation' },
      { name: 'centerTitle', type: 'boolean', defaultValue: false, label: 'Center Title' },
      { name: 'automaticallyImplyLeading', type: 'boolean', defaultValue: true, label: 'Show Back Button' },
    ],
  },
  {
    type: 'BottomNavigationBar',
    category: 'navigation',
    displayName: 'Bottom Navigation',
    icon: 'PanelBottom',
    description: 'A Material Design bottom navigation bar.',
    canHaveChildren: false,
    properties: [
      { name: 'backgroundColor', type: 'color', defaultValue: '#1E1E2E', label: 'Background Color' },
      { name: 'selectedItemColor', type: 'color', defaultValue: '#7B6DFF', label: 'Selected Color' },
      { name: 'unselectedItemColor', type: 'color', defaultValue: '#A7ACB8', label: 'Unselected Color' },
      { name: 'currentIndex', type: 'number', defaultValue: 0, label: 'Current Index' },
    ],
  },
  {
    type: 'TabBar',
    category: 'navigation',
    displayName: 'Tab Bar',
    icon: 'Tabs',
    description: 'A Material Design tab bar.',
    canHaveChildren: false,
    properties: [
      { name: 'tabs', type: 'string', defaultValue: 'Tab 1, Tab 2, Tab 3', label: 'Tabs (comma separated)' },
      { name: 'indicatorColor', type: 'color', defaultValue: '#7B6DFF', label: 'Indicator Color' },
      { name: 'labelColor', type: 'color', defaultValue: '#F2F4F8', label: 'Label Color' },
      { name: 'unselectedLabelColor', type: 'color', defaultValue: '#A7ACB8', label: 'Unselected Label Color' },
    ],
  },
  {
    type: 'Drawer',
    category: 'navigation',
    displayName: 'Drawer',
    icon: 'PanelLeft',
    description: 'A Material Design drawer.',
    canHaveChildren: true,
    properties: [
      { name: 'backgroundColor', type: 'color', defaultValue: '#1E1E2E', label: 'Background Color' },
      { name: 'width', type: 'double', defaultValue: 304, label: 'Width' },
      { name: 'elevation', type: 'double', defaultValue: 16, label: 'Elevation' },
    ],
  },
  {
    type: 'FloatingActionButton',
    category: 'navigation',
    displayName: 'FAB',
    icon: 'PlusCircle',
    description: 'A Material Design floating action button.',
    canHaveChildren: true,
    properties: [
      { name: 'backgroundColor', type: 'color', defaultValue: '#7B6DFF', label: 'Background Color' },
      { name: 'foregroundColor', type: 'color', defaultValue: '#FFFFFF', label: 'Foreground Color' },
      { name: 'elevation', type: 'double', defaultValue: 6, label: 'Elevation' },
      { name: 'mini', type: 'boolean', defaultValue: false, label: 'Mini' },
    ],
  },

  // Effects Widgets
  {
    type: 'Opacity',
    category: 'effects',
    displayName: 'Opacity',
    icon: 'Eye',
    description: 'A widget that makes its child partially transparent.',
    canHaveChildren: true,
    properties: [
      { name: 'opacity', type: 'double', defaultValue: 0.5, label: 'Opacity' },
    ],
  },
  {
    type: 'ClipRRect',
    category: 'effects',
    displayName: 'Clip RRect',
    icon: 'Square',
    description: 'A widget that clips its child using a rounded rectangle.',
    canHaveChildren: true,
    properties: [
      { name: 'borderRadius', type: 'double', defaultValue: 12, label: 'Border Radius' },
    ],
  },
  {
    type: 'Transform',
    category: 'effects',
    displayName: 'Transform',
    icon: 'RotateCw',
    description: 'A widget that applies a transformation to its child.',
    canHaveChildren: true,
    properties: [
      { name: 'rotation', type: 'double', defaultValue: 0, label: 'Rotation (radians)' },
      { name: 'scale', type: 'double', defaultValue: 1, label: 'Scale' },
      { name: 'translateX', type: 'double', defaultValue: 0, label: 'Translate X' },
      { name: 'translateY', type: 'double', defaultValue: 0, label: 'Translate Y' },
    ],
  },
  {
    type: 'AnimatedContainer',
    category: 'effects',
    displayName: 'Animated Container',
    icon: 'BoxSelect',
    description: 'A container that animates its properties.',
    canHaveChildren: true,
    properties: [
      { name: 'width', type: 'double', defaultValue: 100, label: 'Width' },
      { name: 'height', type: 'double', defaultValue: 100, label: 'Height' },
      { name: 'color', type: 'color', defaultValue: '#7B6DFF', label: 'Color' },
      { name: 'borderRadius', type: 'double', defaultValue: 8, label: 'Border Radius' },
      { name: 'duration', type: 'number', defaultValue: 300, label: 'Duration (ms)' },
    ],
  },
  {
    type: 'Hero',
    category: 'effects',
    displayName: 'Hero',
    icon: 'Sparkles',
    description: 'A widget that marks its child as a candidate for hero animations.',
    canHaveChildren: true,
    properties: [
      { name: 'tag', type: 'string', defaultValue: 'hero', label: 'Tag' },
    ],
  },
];

export const getWidgetDefinition = (type: string): WidgetDefinition | undefined => {
  return widgetDefinitions.find(w => w.type === type);
};

export const getWidgetsByCategory = (category: WidgetCategory): WidgetDefinition[] => {
  return widgetDefinitions.filter(w => w.category === category);
};

export const createDefaultWidgetInstance = (type: string): { type: string; properties: Record<string, unknown> } => {
  const def = getWidgetDefinition(type);
  if (!def) {
    return { type, properties: {} };
  }
  
  const properties: Record<string, unknown> = {};
  def.properties.forEach(prop => {
    properties[prop.name] = prop.defaultValue;
  });
  
  return { type, properties };
};
