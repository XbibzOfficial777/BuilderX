import type { WidgetInstance } from '@/types/widget';
import { getWidgetDefinition } from './widgets';

const indent = (level: number): string => '  '.repeat(level);

const formatValue = (value: unknown, type: string): string => {
  if (value === null || value === undefined) {
    return 'null';
  }
  
  switch (type) {
    case 'string':
      return `'${String(value).replace(/'/g, "\\'")}'`;
    case 'color':
      return `Color(0xFF${String(value).replace('#', '')})`;
    case 'boolean':
      return String(value);
    case 'number':
    case 'double':
      return String(value);
    case 'edgeInsets':
      const edge = value as { top: number; right: number; bottom: number; left: number };
      if (edge.top === edge.right && edge.right === edge.bottom && edge.bottom === edge.left) {
        return `EdgeInsets.all(${edge.top})`;
      }
      return `EdgeInsets.only(top: ${edge.top}, right: ${edge.right}, bottom: ${edge.bottom}, left: ${edge.left})`;
    case 'alignment':
      const alignments: Record<string, string> = {
        'topLeft': 'Alignment.topLeft',
        'topCenter': 'Alignment.topCenter',
        'topRight': 'Alignment.topRight',
        'centerLeft': 'Alignment.centerLeft',
        'center': 'Alignment.center',
        'centerRight': 'Alignment.centerRight',
        'bottomLeft': 'Alignment.bottomLeft',
        'bottomCenter': 'Alignment.bottomCenter',
        'bottomRight': 'Alignment.bottomRight',
      };
      return alignments[String(value)] || 'Alignment.topLeft';
    case 'enum':
      return String(value);
    default:
      return String(value);
  }
};

const generateWidgetCode = (widget: WidgetInstance, level: number = 0): string => {
  const def = getWidgetDefinition(widget.type);
  if (!def) {
    return `${indent(level)}// Unknown widget: ${widget.type}`;
  }
  
  const props = widget.properties;
  const lines: string[] = [];
  
  switch (widget.type) {
    case 'Container':
      lines.push(`${indent(level)}Container(`);
      if (props.width) lines.push(`${indent(level + 1)}width: ${props.width},`);
      if (props.height) lines.push(`${indent(level + 1)}height: ${props.height},`);
      if (props.color) lines.push(`${indent(level + 1)}color: ${formatValue(props.color, 'color')},`);
      if (props.borderRadius && (props.borderRadius as number) > 0) {
        lines.push(`${indent(level + 1)}decoration: BoxDecoration(`);
        lines.push(`${indent(level + 2)}borderRadius: BorderRadius.circular(${props.borderRadius}),`);
        lines.push(`${indent(level + 1)}),`);
      }
      if (props.padding) {
        const padding = props.padding as { top: number; right: number; bottom: number; left: number };
        if (padding.top || padding.right || padding.bottom || padding.left) {
          lines.push(`${indent(level + 1)}padding: ${formatValue(props.padding, 'edgeInsets')},`);
        }
      }
      if (props.margin) {
        const margin = props.margin as { top: number; right: number; bottom: number; left: number };
        if (margin.top || margin.right || margin.bottom || margin.left) {
          lines.push(`${indent(level + 1)}margin: ${formatValue(props.margin, 'edgeInsets')},`);
        }
      }
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Text':
      lines.push(`${indent(level)}Text(`);
      lines.push(`${indent(level + 1)}${formatValue(props.data, 'string')},`);
      lines.push(`${indent(level + 1)}style: TextStyle(`);
      if (props.fontSize) lines.push(`${indent(level + 2)}fontSize: ${props.fontSize},`);
      if (props.color) lines.push(`${indent(level + 2)}color: ${formatValue(props.color, 'color')},`);
      if (props.fontWeight && props.fontWeight !== 'normal') {
        lines.push(`${indent(level + 2)}fontWeight: FontWeight.${props.fontWeight},`);
      }
      if (props.textAlign && props.textAlign !== 'left') {
        lines.push(`${indent(level + 1)}),`);
        lines.push(`${indent(level + 1)}textAlign: TextAlign.${props.textAlign},`);
      } else {
        lines.push(`${indent(level + 1)}),`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Icon':
      lines.push(`${indent(level)}Icon(`);
      lines.push(`${indent(level + 1)}Icons.${props.icon},`);
      if (props.size && props.size !== 24) lines.push(`${indent(level + 1)}size: ${props.size},`);
      if (props.color) lines.push(`${indent(level + 1)}color: ${formatValue(props.color, 'color')},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Image':
      lines.push(`${indent(level)}Image.network(`);
      lines.push(`${indent(level + 1)}${formatValue(props.url, 'string')},`);
      if (props.width) lines.push(`${indent(level + 1)}width: ${props.width},`);
      if (props.height) lines.push(`${indent(level + 1)}height: ${props.height},`);
      if (props.fit && props.fit !== 'cover') lines.push(`${indent(level + 1)}fit: BoxFit.${props.fit},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Row':
      lines.push(`${indent(level)}Row(`);
      if (props.mainAxisAlignment && props.mainAxisAlignment !== 'start') {
        lines.push(`${indent(level + 1)}mainAxisAlignment: MainAxisAlignment.${props.mainAxisAlignment},`);
      }
      if (props.crossAxisAlignment && props.crossAxisAlignment !== 'center') {
        lines.push(`${indent(level + 1)}crossAxisAlignment: CrossAxisAlignment.${props.crossAxisAlignment},`);
      }
      if (props.mainAxisSize && props.mainAxisSize !== 'max') {
        lines.push(`${indent(level + 1)}mainAxisSize: MainAxisSize.${props.mainAxisSize},`);
      }
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}children: [`);
        widget.children.forEach((child, i) => {
          lines.push(generateWidgetCode(child, level + 2) + (i < widget.children.length - 1 ? ',' : ''));
        });
        lines.push(`${indent(level + 1)}],`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Column':
      lines.push(`${indent(level)}Column(`);
      if (props.mainAxisAlignment && props.mainAxisAlignment !== 'start') {
        lines.push(`${indent(level + 1)}mainAxisAlignment: MainAxisAlignment.${props.mainAxisAlignment},`);
      }
      if (props.crossAxisAlignment && props.crossAxisAlignment !== 'center') {
        lines.push(`${indent(level + 1)}crossAxisAlignment: CrossAxisAlignment.${props.crossAxisAlignment},`);
      }
      if (props.mainAxisSize && props.mainAxisSize !== 'max') {
        lines.push(`${indent(level + 1)}mainAxisSize: MainAxisSize.${props.mainAxisSize},`);
      }
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}children: [`);
        widget.children.forEach((child, i) => {
          lines.push(generateWidgetCode(child, level + 2) + (i < widget.children.length - 1 ? ',' : ''));
        });
        lines.push(`${indent(level + 1)}],`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Stack':
      lines.push(`${indent(level)}Stack(`);
      if (props.alignment && props.alignment !== 'topLeft') {
        lines.push(`${indent(level + 1)}alignment: ${formatValue(props.alignment, 'alignment')},`);
      }
      if (props.fit && props.fit !== 'loose') {
        lines.push(`${indent(level + 1)}fit: StackFit.${props.fit},`);
      }
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}children: [`);
        widget.children.forEach((child, i) => {
          lines.push(generateWidgetCode(child, level + 2) + (i < widget.children.length - 1 ? ',' : ''));
        });
        lines.push(`${indent(level + 1)}],`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Center':
      lines.push(`${indent(level)}Center(`);
      if (props.widthFactor) lines.push(`${indent(level + 1)}widthFactor: ${props.widthFactor},`);
      if (props.heightFactor) lines.push(`${indent(level + 1)}heightFactor: ${props.heightFactor},`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Padding':
      lines.push(`${indent(level)}Padding(`);
      lines.push(`${indent(level + 1)}padding: ${formatValue(props.padding, 'edgeInsets')},`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Expanded':
      lines.push(`${indent(level)}Expanded(`);
      if (props.flex && props.flex !== 1) lines.push(`${indent(level + 1)}flex: ${props.flex},`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'SizedBox':
      lines.push(`${indent(level)}SizedBox(`);
      if (props.width) lines.push(`${indent(level + 1)}width: ${props.width},`);
      if (props.height) lines.push(`${indent(level + 1)}height: ${props.height},`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'TextField':
      lines.push(`${indent(level)}TextField(`);
      if (props.hintText) lines.push(`${indent(level + 1)}hintText: ${formatValue(props.hintText, 'string')},`);
      if (props.labelText) lines.push(`${indent(level + 1)}labelText: ${formatValue(props.labelText, 'string')},`);
      if (props.obscureText) lines.push(`${indent(level + 1)}obscureText: true,`);
      if (props.maxLines && props.maxLines !== 1) lines.push(`${indent(level + 1)}maxLines: ${props.maxLines},`);
      if (props.borderRadius && (props.borderRadius as number) > 0) {
        lines.push(`${indent(level + 1)}decoration: InputDecoration(`);
        lines.push(`${indent(level + 2)}border: OutlineInputBorder(`);
        lines.push(`${indent(level + 3)}borderRadius: BorderRadius.circular(${props.borderRadius}),`);
        lines.push(`${indent(level + 2)}),`);
        lines.push(`${indent(level + 1)}),`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'ElevatedButton':
      lines.push(`${indent(level)}ElevatedButton(`);
      lines.push(`${indent(level + 1)}onPressed: () {},`);
      lines.push(`${indent(level + 1)}style: ElevatedButton.styleFrom(`);
      if (props.backgroundColor) lines.push(`${indent(level + 2)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (props.foregroundColor) lines.push(`${indent(level + 2)}foregroundColor: ${formatValue(props.foregroundColor, 'color')},`);
      if (props.borderRadius && (props.borderRadius as number) > 0) {
        lines.push(`${indent(level + 2)}shape: RoundedRectangleBorder(`);
        lines.push(`${indent(level + 3)}borderRadius: BorderRadius.circular(${props.borderRadius}),`);
        lines.push(`${indent(level + 2)}),`);
      }
      if (props.elevation && props.elevation !== 2) lines.push(`${indent(level + 2)}elevation: ${props.elevation},`);
      lines.push(`${indent(level + 1)}),`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      } else {
        lines.push(`${indent(level + 1)}child: Text('Button'),`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'TextButton':
      lines.push(`${indent(level)}TextButton(`);
      lines.push(`${indent(level + 1)}onPressed: () {},`);
      lines.push(`${indent(level + 1)}style: TextButton.styleFrom(`);
      if (props.foregroundColor) lines.push(`${indent(level + 2)}foregroundColor: ${formatValue(props.foregroundColor, 'color')},`);
      lines.push(`${indent(level + 1)}),`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      } else {
        lines.push(`${indent(level + 1)}child: Text('Button'),`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'IconButton':
      lines.push(`${indent(level)}IconButton(`);
      lines.push(`${indent(level + 1)}onPressed: () {},`);
      lines.push(`${indent(level + 1)}icon: Icon(Icons.${props.icon}),`);
      if (props.iconSize && props.iconSize !== 24) lines.push(`${indent(level + 1)}iconSize: ${props.iconSize},`);
      if (props.color) lines.push(`${indent(level + 1)}color: ${formatValue(props.color, 'color')},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Checkbox':
      lines.push(`${indent(level)}Checkbox(`);
      lines.push(`${indent(level + 1)}value: ${props.value},`);
      lines.push(`${indent(level + 1)}onChanged: (value) {},`);
      if (props.activeColor) lines.push(`${indent(level + 1)}activeColor: ${formatValue(props.activeColor, 'color')},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Switch':
      lines.push(`${indent(level)}Switch(`);
      lines.push(`${indent(level + 1)}value: ${props.value},`);
      lines.push(`${indent(level + 1)}onChanged: (value) {},`);
      if (props.activeColor) lines.push(`${indent(level + 1)}activeColor: ${formatValue(props.activeColor, 'color')},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Slider':
      lines.push(`${indent(level)}Slider(`);
      lines.push(`${indent(level + 1)}value: ${props.value},`);
      lines.push(`${indent(level + 1)}onChanged: (value) {},`);
      if (props.min && props.min !== 0) lines.push(`${indent(level + 1)}min: ${props.min},`);
      if (props.max && props.max !== 1) lines.push(`${indent(level + 1)}max: ${props.max},`);
      if (props.activeColor) lines.push(`${indent(level + 1)}activeColor: ${formatValue(props.activeColor, 'color')},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Card':
      lines.push(`${indent(level)}Card(`);
      if (props.color) lines.push(`${indent(level + 1)}color: ${formatValue(props.color, 'color')},`);
      if (props.borderRadius && props.borderRadius !== 12) {
        lines.push(`${indent(level + 1)}shape: RoundedRectangleBorder(`);
        lines.push(`${indent(level + 2)}borderRadius: BorderRadius.circular(${props.borderRadius}),`);
        lines.push(`${indent(level + 1)}),`);
      }
      if (props.elevation && props.elevation !== 2) lines.push(`${indent(level + 1)}elevation: ${props.elevation},`);
      if (props.margin) {
        const margin = props.margin as { top: number; right: number; bottom: number; left: number };
        if (margin.top || margin.right || margin.bottom || margin.left) {
          lines.push(`${indent(level + 1)}margin: ${formatValue(props.margin, 'edgeInsets')},`);
        }
      }
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'ListTile':
      lines.push(`${indent(level)}ListTile(`);
      if (props.title) lines.push(`${indent(level + 1)}title: Text(${formatValue(props.title, 'string')}),`);
      if (props.subtitle) lines.push(`${indent(level + 1)}subtitle: Text(${formatValue(props.subtitle, 'string')}),`);
      if (props.leadingIcon && props.leadingIcon !== 'none') {
        lines.push(`${indent(level + 1)}leading: Icon(Icons.${props.leadingIcon}),`);
      }
      if (props.trailingIcon && props.trailingIcon !== 'none') {
        lines.push(`${indent(level + 1)}trailing: Icon(Icons.${props.trailingIcon}),`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Chip':
      lines.push(`${indent(level)}Chip(`);
      lines.push(`${indent(level + 1)}label: Text(${formatValue(props.label, 'string')}),`);
      if (props.backgroundColor) lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (props.labelColor && props.labelColor !== '#F2F4F8') {
        lines.push(`${indent(level + 1)}labelStyle: TextStyle(color: ${formatValue(props.labelColor, 'color')}),`);
      }
      if (props.avatar && props.avatar !== 'none') {
        lines.push(`${indent(level + 1)}avatar: CircleAvatar(child: Text('A')),`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Badge':
      lines.push(`${indent(level)}Badge(`);
      lines.push(`${indent(level + 1)}label: Text(${formatValue(props.label, 'string')}),`);
      if (props.backgroundColor && props.backgroundColor !== '#FF2E8C') {
        lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      }
      if (props.textColor && props.textColor !== '#FFFFFF') {
        lines.push(`${indent(level + 1)}textColor: ${formatValue(props.textColor, 'color')},`);
      }
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'CircularProgressIndicator':
      lines.push(`${indent(level)}CircularProgressIndicator(`);
      if (props.value !== null && props.value !== undefined) lines.push(`${indent(level + 1)}value: ${props.value},`);
      if (props.color) lines.push(`${indent(level + 1)}color: ${formatValue(props.color, 'color')},`);
      if (props.strokeWidth && props.strokeWidth !== 4) lines.push(`${indent(level + 1)}strokeWidth: ${props.strokeWidth},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'LinearProgressIndicator':
      lines.push(`${indent(level)}LinearProgressIndicator(`);
      if (props.value !== undefined) lines.push(`${indent(level + 1)}value: ${props.value},`);
      if (props.backgroundColor) lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (props.valueColor) lines.push(`${indent(level + 1)}valueColor: AlwaysStoppedAnimation<Color>(${formatValue(props.valueColor, 'color')}),`);
      if (props.minHeight && props.minHeight !== 4) lines.push(`${indent(level + 1)}minHeight: ${props.minHeight},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Divider':
      lines.push(`${indent(level)}Divider(`);
      if (props.color && props.color !== '#3D3D4D') lines.push(`${indent(level + 1)}color: ${formatValue(props.color, 'color')},`);
      if (props.thickness && props.thickness !== 1) lines.push(`${indent(level + 1)}thickness: ${props.thickness},`);
      if (props.indent && (props.indent as number) > 0) lines.push(`${indent(level + 1)}indent: ${props.indent},`);
      if (props.endIndent && (props.endIndent as number) > 0) lines.push(`${indent(level + 1)}endIndent: ${props.endIndent},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'AppBar':
      lines.push(`${indent(level)}AppBar(`);
      if (props.title) lines.push(`${indent(level + 1)}title: Text(${formatValue(props.title, 'string')}),`);
      if (props.backgroundColor) lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (props.foregroundColor) lines.push(`${indent(level + 1)}foregroundColor: ${formatValue(props.foregroundColor, 'color')},`);
      if (props.elevation && props.elevation !== 4) lines.push(`${indent(level + 1)}elevation: ${props.elevation},`);
      if (props.centerTitle) lines.push(`${indent(level + 1)}centerTitle: true,`);
      if (!props.automaticallyImplyLeading) lines.push(`${indent(level + 1)}automaticallyImplyLeading: false,`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'BottomNavigationBar':
      lines.push(`${indent(level)}BottomNavigationBar(`);
      lines.push(`${indent(level + 1)}currentIndex: ${props.currentIndex || 0},`);
      lines.push(`${indent(level + 1)}onTap: (index) {},`);
      if (props.backgroundColor) lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (props.selectedItemColor) lines.push(`${indent(level + 1)}selectedItemColor: ${formatValue(props.selectedItemColor, 'color')},`);
      if (props.unselectedItemColor) lines.push(`${indent(level + 1)}unselectedItemColor: ${formatValue(props.unselectedItemColor, 'color')},`);
      lines.push(`${indent(level + 1)}items: const [`);
      lines.push(`${indent(level + 2)}BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),`);
      lines.push(`${indent(level + 2)}BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),`);
      lines.push(`${indent(level + 2)}BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),`);
      lines.push(`${indent(level + 1)}],`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'TabBar':
      lines.push(`${indent(level)}TabBar(`);
      lines.push(`${indent(level + 1)}tabs: const [`);
      const tabs = String(props.tabs || 'Tab 1, Tab 2, Tab 3').split(',').map(t => t.trim());
      tabs.forEach(tab => {
        lines.push(`${indent(level + 2)}Tab(text: ${formatValue(tab, 'string')}),`);
      });
      lines.push(`${indent(level + 1)}],`);
      if (props.indicatorColor) lines.push(`${indent(level + 1)}indicatorColor: ${formatValue(props.indicatorColor, 'color')},`);
      if (props.labelColor) lines.push(`${indent(level + 1)}labelColor: ${formatValue(props.labelColor, 'color')},`);
      if (props.unselectedLabelColor) lines.push(`${indent(level + 1)}unselectedLabelColor: ${formatValue(props.unselectedLabelColor, 'color')},`);
      lines.push(`${indent(level)})`);
      break;
      
    case 'Drawer':
      lines.push(`${indent(level)}Drawer(`);
      if (props.backgroundColor) lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (props.elevation && props.elevation !== 16) lines.push(`${indent(level + 1)}elevation: ${props.elevation},`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'FloatingActionButton':
      lines.push(`${indent(level)}FloatingActionButton(`);
      lines.push(`${indent(level + 1)}onPressed: () {},`);
      if (props.backgroundColor) lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (props.foregroundColor) lines.push(`${indent(level + 1)}foregroundColor: ${formatValue(props.foregroundColor, 'color')},`);
      if (props.elevation && props.elevation !== 6) lines.push(`${indent(level + 1)}elevation: ${props.elevation},`);
      if (props.mini) lines.push(`${indent(level + 1)}mini: true,`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      } else {
        lines.push(`${indent(level + 1)}child: Icon(Icons.add),`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Opacity':
      lines.push(`${indent(level)}Opacity(`);
      lines.push(`${indent(level + 1)}opacity: ${props.opacity},`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'ClipRRect':
      lines.push(`${indent(level)}ClipRRect(`);
      lines.push(`${indent(level + 1)}borderRadius: BorderRadius.circular(${props.borderRadius || 12}),`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Transform':
      lines.push(`${indent(level)}Transform(`);
      lines.push(`${indent(level + 1)}transform: Matrix4.identity()`);
      if (props.rotation && props.rotation !== 0) {
        lines.push(`${indent(level + 2)}..rotateZ(${props.rotation})`);
      }
      if (props.scale && props.scale !== 1) {
        lines.push(`${indent(level + 2)}..scale(${props.scale})`);
      }
      if (props.translateX || props.translateY) {
        lines.push(`${indent(level + 2)}..translate(${props.translateX || 0}, ${props.translateY || 0})`);
      }
      lines.push(`,`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'AnimatedContainer':
      lines.push(`${indent(level)}AnimatedContainer(`);
      if (props.width) lines.push(`${indent(level + 1)}width: ${props.width},`);
      if (props.height) lines.push(`${indent(level + 1)}height: ${props.height},`);
      if (props.color) lines.push(`${indent(level + 1)}color: ${formatValue(props.color, 'color')},`);
      if (props.borderRadius && (props.borderRadius as number) > 0) {
        lines.push(`${indent(level + 1)}decoration: BoxDecoration(`);
        lines.push(`${indent(level + 2)}borderRadius: BorderRadius.circular(${props.borderRadius}),`);
        lines.push(`${indent(level + 1)}),`);
      }
      lines.push(`${indent(level + 1)}duration: Duration(milliseconds: ${props.duration || 300}),`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Hero':
      lines.push(`${indent(level)}Hero(`);
      lines.push(`${indent(level + 1)}tag: ${formatValue(props.tag, 'string')},`);
      if (widget.children.length > 0) {
        lines.push(`${indent(level + 1)}child: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    case 'Scaffold':
      lines.push(`${indent(level)}Scaffold(`);
      if (props.backgroundColor) lines.push(`${indent(level + 1)}backgroundColor: ${formatValue(props.backgroundColor, 'color')},`);
      if (widget.children.length > 0) {
        // First child could be app bar, rest is body
        lines.push(`${indent(level + 1)}body: ${generateWidgetCode(widget.children[0], level + 1).trim()},`);
      }
      lines.push(`${indent(level)})`);
      break;
      
    default:
      lines.push(`${indent(level)}// ${widget.type} not yet implemented`);
  }
  
  return lines.join('\n');
};

export const generateFullCode = (widgetTree: WidgetInstance | null): string => {
  if (!widgetTree) {
    return '// No widget tree to generate';
  }
  
  const lines: string[] = [];
  
  lines.push("import 'package:flutter/material.dart';");
  lines.push('');
  lines.push('class MyApp extends StatelessWidget {');
  lines.push('  const MyApp({super.key});');
  lines.push('');
  lines.push('  @override');
  lines.push('  Widget build(BuildContext context) {');
  lines.push('    return MaterialApp(');
  lines.push("      title: 'FlutterForge App',");
  lines.push('      theme: ThemeData(');
  lines.push('        primarySwatch: Colors.blue,');
  lines.push('        useMaterial3: true,');
  lines.push('      ),');
  lines.push('      home: const HomePage(),');
  lines.push('    );');
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push('class HomePage extends StatelessWidget {');
  lines.push('  const HomePage({super.key});');
  lines.push('');
  lines.push('  @override');
  lines.push('  Widget build(BuildContext context) {');
  lines.push('    return ' + generateWidgetCode(widgetTree, 2) + ';');
  lines.push('  }');
  lines.push('}');
  
  return lines.join('\n');
};

export const generateWidgetOnlyCode = (widgetTree: WidgetInstance | null): string => {
  if (!widgetTree) {
    return '// No widget tree to generate';
  }
  
  return generateWidgetCode(widgetTree, 0);
};
