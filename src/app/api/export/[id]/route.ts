import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { db } from '@/lib/db';

// GET /api/export/[id] - Export project as ZIP with Dart files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await db.project.findUnique({
      where: { id },
    });

    if (!project) {
      // Demo mode - create a sample project
      const demoProject = {
        name: 'Demo Project',
        widgetTree: JSON.stringify({
          id: 'root',
          type: 'Scaffold',
          name: 'Scaffold',
          properties: {},
          children: [],
        }),
      };
      
      const zip = await generateFlutterProjectZip(demoProject.name, demoProject.widgetTree);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      return new NextResponse(zipBlob, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${demoProject.name.replace(/\s+/g, '_')}.zip"`,
        },
      });
    }

    const zip = await generateFlutterProjectZip(project.name, project.widgetTree);
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.name.replace(/\s+/g, '_')}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    );
  }
}

async function generateFlutterProjectZip(projectName: string, widgetTree: string): Promise<JSZip> {
  const zip = new JSZip();
  const projectNameSlug = projectName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  // Create folder structure
  const libFolder = zip.folder('lib');
  const androidFolder = zip.folder('android');
  const iosFolder = zip.folder('ios');
  const webFolder = zip.folder('web');
  const testFolder = zip.folder('test');

  // Add main.dart
  if (libFolder) {
    libFolder.file('main.dart', generateMainDart(widgetTree, projectName));
  }

  // Add pubspec.yaml
  zip.file('pubspec.yaml', generatePubspecYaml(projectNameSlug));

  // Add analysis_options.yaml
  zip.file('analysis_options.yaml', generateAnalysisOptions());

  // Add README.md
  zip.file('README.md', generateReadme(projectName));

  // Add basic Android files
  if (androidFolder) {
    androidFolder.file('app/build.gradle', generateAndroidBuildGradle(projectNameSlug));
    androidFolder.file('app/src/main/AndroidManifest.xml', generateAndroidManifest(projectNameSlug));
  }

  // Add basic iOS files
  if (iosFolder) {
    iosFolder.file('Runner/Info.plist', generateIOSInfoPlist(projectName));
  }

  // Add basic web files
  if (webFolder) {
    webFolder.file('index.html', generateWebIndexHtml(projectName));
    webFolder.file('manifest.json', generateWebManifest(projectNameSlug));
  }

  // Add test file
  if (testFolder) {
    testFolder.file('widget_test.dart', generateWidgetTest(projectNameSlug));
  }

  // Add .gitignore
  zip.file('.gitignore', generateGitignore());

  return zip;
}

function generateMainDart(widgetTree: string, projectName: string): string {
  let parsedTree;
  try {
    parsedTree = JSON.parse(widgetTree);
  } catch {
    parsedTree = { type: 'Scaffold', properties: {}, children: [] };
  }

  const widgetCode = generateWidgetCode(parsedTree, 2);

  return `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${projectName}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF9C27B0)),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return ${widgetCode};
  }
}
`;
}

function generateWidgetCode(node: { type: string; name?: string; properties: Record<string, unknown>; children: unknown[] }, indent: number): string {
  const spaces = '  '.repeat(indent);
  const innerSpaces = '  '.repeat(indent + 1);
  const nextSpaces = '  '.repeat(indent + 2);

  switch (node.type) {
    case 'Scaffold': {
      const bodyCode = node.children && node.children.length > 0 
        ? generateWidgetCode(node.children[0] as Parameters<typeof generateWidgetCode>[0], indent + 1)
        : 'const Center(child: Text(\'Hello FlutterForge!\'))';
      
      const appBar = node.properties.appBar ? 
        `${innerSpaces}appBar: ${generateAppBarCode(node.properties.appBar as Record<string, unknown>, indent + 1)},\n` : '';
      
      const floatingActionButton = node.properties.floatingActionButton ?
        `${innerSpaces}floatingActionButton: ${generateWidgetCode(node.properties.floatingActionButton as Parameters<typeof generateWidgetCode>[0], indent + 1)},\n` : '';

      return `Scaffold(
${appBar}${appBar ? '' : ''}${innerSpaces}body: ${bodyCode},
${floatingActionButton}${spaces}})`;
    }

    case 'Container': {
      const props: string[] = [];
      
      if (node.properties.width) props.push(`width: ${node.properties.width}`);
      if (node.properties.height) props.push(`height: ${node.properties.height}`);
      if (node.properties.padding) props.push(`padding: const EdgeInsets.all(${node.properties.padding})`);
      
      const decoration: string[] = [];
      if (node.properties.color) {
        decoration.push(`color: ${colorToDart(String(node.properties.color))}`);
      }
      if (node.properties.borderRadius) {
        decoration.push(`borderRadius: BorderRadius.circular(${node.properties.borderRadius})`);
      }
      if (decoration.length > 0) {
        props.push(`decoration: BoxDecoration(
${nextSpaces}${decoration.join(`,\n${nextSpaces}`)}
${innerSpaces})`);
      }
      
      const childCode = node.children && node.children.length > 0
        ? generateWidgetCode(node.children[0] as Parameters<typeof generateWidgetCode>[0], indent + 1)
        : null;

      let result = `Container(`;
      if (props.length > 0) {
        result += `\n${props.map(p => `${innerSpaces}${p}`).join(',\n')}`;
      }
      if (childCode) {
        result += `,\n${innerSpaces}child: ${childCode}`;
      }
      result += `,\n${spaces})`;
      return result;
    }

    case 'Row':
    case 'Column': {
      const props: string[] = [];
      
      if (node.properties.mainAxisAlignment) {
        props.push(`mainAxisAlignment: MainAxisAlignment.${node.properties.mainAxisAlignment}`);
      }
      if (node.properties.crossAxisAlignment) {
        props.push(`crossAxisAlignment: CrossAxisAlignment.${node.properties.crossAxisAlignment}`);
      }
      
      const childrenCode = node.children && node.children.length > 0
        ? (node.children as unknown[]).map((c) => generateWidgetCode(c as Parameters<typeof generateWidgetCode>[0], indent + 2)).join(',\n')
        : '';

      let result = `${node.type}(`;
      if (props.length > 0) {
        result += `\n${props.map(p => `${innerSpaces}${p}`).join(',\n')}`;
      }
      if (childrenCode) {
        result += `,\n${innerSpaces}children: [
${childrenCode}
${innerSpaces}]`;
      }
      result += `,\n${spaces})`;
      return result;
    }

    case 'Stack': {
      const childrenCode = node.children && node.children.length > 0
        ? (node.children as unknown[]).map((c) => generateWidgetCode(c as Parameters<typeof generateWidgetCode>[0], indent + 2)).join(',\n')
        : '';

      return `Stack(
${innerSpaces}children: [
${childrenCode || `${nextSpaces}const SizedBox()`}
${innerSpaces}],
${spaces})`;
    }

    case 'Expanded': {
      const childCode = node.children && node.children.length > 0
        ? generateWidgetCode(node.children[0] as Parameters<typeof generateWidgetCode>[0], indent + 1)
        : 'const SizedBox()';
      
      return `Expanded(
${innerSpaces}flex: ${node.properties.flex || 1},
${innerSpaces}child: ${childCode},
${spaces})`;
    }

    case 'ListView': {
      const childrenCode = node.children && node.children.length > 0
        ? (node.children as unknown[]).map((c) => generateWidgetCode(c as Parameters<typeof generateWidgetCode>[0], indent + 2)).join(',\n')
        : '';

      return `ListView(
${innerSpaces}padding: const EdgeInsets.all(${node.properties.padding || 0}),
${innerSpaces}children: [
${childrenCode || `${nextSpaces}const SizedBox()`}
${innerSpaces}],
${spaces})`;
    }

    case 'GridView': {
      return `GridView.count(
${innerSpaces}crossAxisCount: ${node.properties.crossAxisCount || 2},
${innerSpaces}mainAxisSpacing: ${node.properties.mainAxisSpacing || 10},
${innerSpaces}crossAxisSpacing: ${node.properties.crossAxisSpacing || 10},
${innerSpaces}children: const [SizedBox()],
${spaces})`;
    }

    case 'Text': {
      const textStyle: string[] = [];
      
      if (node.properties.fontSize) textStyle.push(`fontSize: ${node.properties.fontSize}`);
      if (node.properties.color) textStyle.push(`color: ${colorToDart(String(node.properties.color))}`);
      if (node.properties.fontWeight) {
        const fw = String(node.properties.fontWeight);
        if (fw === 'bold') textStyle.push('fontWeight: FontWeight.bold');
        else if (fw.startsWith('w')) textStyle.push(`fontWeight: FontWeight.${fw}`);
      }
      
      const textAlign = node.properties.textAlign ? `textAlign: TextAlign.${node.properties.textAlign}` : '';

      if (textStyle.length > 0) {
        return `Text(
${innerSpaces}'${escapeDartString(String(node.properties.text || 'Text'))}',
${innerSpaces}style: TextStyle(
${nextSpaces}${textStyle.join(`,\n${nextSpaces}`)}
${innerSpaces}),${textAlign ? `,\n${innerSpaces}${textAlign}` : ''}
${spaces})`;
      }
      return `Text('${escapeDartString(String(node.properties.text || 'Text'))}')`;
    }

    case 'Image': {
      return `Image.network(
${innerSpaces}'${escapeDartString(String(node.properties.src || 'https://via.placeholder.com/150'))}',
${innerSpaces}width: ${node.properties.width || 100}.0,
${innerSpaces}height: ${node.properties.height || 100}.0,
${innerSpaces}fit: BoxFit.${node.properties.fit || 'cover'},
${spaces})`;
    }

    case 'Icon': {
      return `Icon(
${innerSpaces}Icons.${node.properties.icon || 'star'},
${innerSpaces}size: ${node.properties.size || 24}.0,
${innerSpaces}color: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${spaces})`;
    }

    case 'ElevatedButton': {
      return `ElevatedButton(
${innerSpaces}onPressed: () {},
${innerSpaces}style: ElevatedButton.styleFrom(
${nextSpaces}backgroundColor: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}),
${innerSpaces}child: Text('${escapeDartString(String(node.properties.label || 'Button'))}'),
${spaces})`;
    }

    case 'OutlinedButton': {
      return `OutlinedButton(
${innerSpaces}onPressed: () {},
${innerSpaces}style: OutlinedButton.styleFrom(
${nextSpaces}foregroundColor: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}),
${innerSpaces}child: Text('${escapeDartString(String(node.properties.label || 'Button'))}'),
${spaces})`;
    }

    case 'TextButton': {
      return `TextButton(
${innerSpaces}onPressed: () {},
${innerSpaces}style: TextButton.styleFrom(
${nextSpaces}foregroundColor: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}),
${innerSpaces}child: Text('${escapeDartString(String(node.properties.label || 'Button'))}'),
${spaces})`;
    }

    case 'FloatingActionButton': {
      return `FloatingActionButton(
${innerSpaces}onPressed: () {},
${innerSpaces}backgroundColor: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}child: const Icon(Icons.${node.properties.icon || 'add'}),
${spaces})`;
    }

    case 'IconButton': {
      return `IconButton(
${innerSpaces}onPressed: () {},
${innerSpaces}icon: const Icon(Icons.${node.properties.icon || 'favorite'}),
${innerSpaces}color: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}iconSize: ${node.properties.size || 24}.0,
${spaces})`;
    }

    case 'TextField': {
      return `TextField(
${innerSpaces}decoration: InputDecoration(
${nextSpaces}labelText: '${escapeDartString(String(node.properties.label || 'Input'))}',
${node.properties.hintText ? `${nextSpaces}hintText: '${escapeDartString(String(node.properties.hintText))}',\n` : ''}${innerSpaces}),
${innerSpaces}obscureText: ${node.properties.obscureText || false},
${spaces})`;
    }

    case 'Card': {
      const childCode = node.children && node.children.length > 0
        ? generateWidgetCode(node.children[0] as Parameters<typeof generateWidgetCode>[0], indent + 1)
        : 'const SizedBox()';
      
      return `Card(
${innerSpaces}elevation: ${node.properties.elevation || 4},
${innerSpaces}color: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}shape: RoundedRectangleBorder(
${nextSpaces}borderRadius: BorderRadius.circular(${node.properties.borderRadius || 8}),
${innerSpaces}),
${innerSpaces}child: ${childCode},
${spaces})`;
    }

    case 'CircularProgressIndicator': {
      return `CircularProgressIndicator(
${innerSpaces}color: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}strokeWidth: ${node.properties.strokeWidth || 4}.0,
${spaces})`;
    }

    case 'LinearProgressIndicator': {
      return `LinearProgressIndicator(
${innerSpaces}color: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${innerSpaces}value: ${node.properties.value || 0.5},
${spaces})`;
    }

    case 'Divider': {
      return `Divider(
${innerSpaces}thickness: ${node.properties.thickness || 1}.0,
${innerSpaces}color: ${node.properties.color ? colorToDart(String(node.properties.color)) : 'null'},
${spaces})`;
    }

    case 'SizedBox': {
      const props: string[] = [];
      if (node.properties.width) props.push(`width: ${node.properties.width}.0`);
      if (node.properties.height) props.push(`height: ${node.properties.height}.0`);
      
      if (props.length === 0) return 'const SizedBox()';
      return `SizedBox(
${props.map(p => `${innerSpaces}${p}`).join(',\n')},
${spaces})`;
    }

    case 'AppBar': {
      return generateAppBarCode(node.properties, indent);
    }

    case 'Checkbox': {
      return `Checkbox(
${innerSpaces}value: ${node.properties.value || false},
${innerSpaces}onChanged: (bool? value) {},
${spaces})`;
    }

    case 'Switch': {
      return `Switch(
${innerSpaces}value: ${node.properties.value || false},
${innerSpaces}onChanged: (bool value) {},
${spaces})`;
    }

    case 'Slider': {
      return `Slider(
${innerSpaces}min: ${node.properties.min || 0}.0,
${innerSpaces}max: ${node.properties.max || 100}.0,
${innerSpaces}value: ${node.properties.value || 50}.0,
${innerSpaces}onChanged: (double value) {},
${spaces})`;
    }

    default:
      return `// ${node.type} widget
const SizedBox()`;
  }
}

function generateAppBarCode(properties: Record<string, unknown>, indent: number): string {
  const spaces = '  '.repeat(indent);
  const innerSpaces = '  '.repeat(indent + 1);
  
  const props: string[] = [];
  if (properties.title) {
    props.push(`title: const Text('${escapeDartString(String(properties.title))}')`);
  }
  if (properties.backgroundColor) {
    props.push(`backgroundColor: ${colorToDart(String(properties.backgroundColor))}`);
  }
  if (properties.centerTitle) {
    props.push(`centerTitle: ${properties.centerTitle}`);
  }
  
  return `AppBar(
${props.map(p => `${innerSpaces}${p}`).join(',\n')},
${spaces})`;
}

function colorToDart(hex: string): string {
  const hexValue = hex.replace('#', '');
  return `const Color(0xFF${hexValue.toUpperCase()})`;
}

function escapeDartString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function generatePubspecYaml(projectName: string): string {
  return `name: ${projectName}
description: A Flutter app generated by FlutterForge
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;
}

function generateAnalysisOptions(): string {
  return `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_literals_to_create_immutables: true
    avoid_print: false
`;
}

function generateReadme(projectName: string): string {
  return `# ${projectName}

A Flutter application generated by [FlutterForge](https://flutterforge.dev).

## Getting Started

This project is a starting point for a Flutter application.

### Prerequisites

- Flutter SDK (>=3.0.0)
- Dart SDK (>=3.0.0)

### Installation

1. Clone this repository
2. Run \`flutter pub get\` to install dependencies
3. Run \`flutter run\` to start the app

## Project Structure

\`\`\`
lib/
  main.dart        # Main application entry point
android/           # Android specific code
ios/               # iOS specific code
web/               # Web specific code
test/              # Test files
\`\`\`

## Generated by FlutterForge

This project was visually designed and generated using FlutterForge - a visual Flutter development platform.

For more information, visit: https://flutterforge.dev
`;
}

function generateAndroidBuildGradle(projectName: string): string {
  return `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

android {
    namespace "com.example.${projectName}"
    compileSdk flutter.compileSdkVersion
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    defaultConfig {
        applicationId "com.example.${projectName}"
        minSdk flutter.minSdkVersion
        targetSdk flutter.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
        }
    }
}

flutter {
    source '../..'
}
`;
}

function generateAndroidManifest(projectName: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="${projectName}"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
`;
}

function generateIOSInfoPlist(projectName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>${projectName}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${projectName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>
`;
}

function generateWebIndexHtml(projectName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <base href="$FLUTTER_BASE_HREF">
  <meta charset="UTF-8">
  <meta content="IE=Edge" http-equiv="X-UA-Compatible">
  <meta name="description" content="A Flutter app generated by FlutterForge">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="${projectName}">
  <link rel="apple-touch-icon" href="icons/Icon-192.png">
  <title>${projectName}</title>
  <link rel="manifest" href="manifest.json">
  <script>
    var serviceWorkerVersion = null;
  </script>
  <script src="flutter_bootstrap.js" async></script>
</head>
<body>
</body>
</html>
`;
}

function generateWebManifest(projectName: string): string {
  return `{
    "name": "${projectName}",
    "short_name": "${projectName}",
    "start_url": ".",
    "display": "standalone",
    "background_color": "#0175C2",
    "theme_color": "#0175C2",
    "description": "A Flutter app generated by FlutterForge",
    "orientation": "portrait-primary",
    "prefer_related_applications": false,
    "icons": [
        {
            "src": "icons/Icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icons/Icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        },
        {
            "src": "icons/Icon-maskable-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
        },
        {
            "src": "icons/Icon-maskable-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
        }
    ]
}
`;
}

function generateWidgetTest(projectName: string): string {
  return `import 'package:flutter_test/flutter_test.dart';
import 'package:${projectName}/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    
    // Verify the app loads
    expect(find.text('Hello FlutterForge!'), findsOneWidget);
  });
}
`;
}

function generateGitignore(): string {
  return `# Miscellaneous
*.class
*.log
*.pyc
*.swp
.DS_Store
.atom/
.buildlog/
.history
.svn/
migrate_working_dir/

# IntelliJ related
*.iml
*.ipr
*.iws
.idea/

# VS Code related
.vscode/

# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
/build/

# Symbolication related
app.*.symbols

# Obfuscation related
app.*.map.json

# Android Studio
/android/app/debug
/android/app/profile
/android/app/release
`;
}
