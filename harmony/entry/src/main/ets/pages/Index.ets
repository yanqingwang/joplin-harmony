/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  AnyJSBundleProvider,
  FileJSBundleProvider,
  MetroJSBundleProvider,
  TraceJSBundleProviderDecorator,
  RNApp,
  RNOHErrorDialog,
  ResourceJSBundleProvider,
  RNOHCoreContext
} from '@rnoh/react-native-openharmony';
import { getRNOHPackages } from '../PackageProvider';

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined;

  build() {
    Column() {
      if (this.rnohCoreContext) {
        if (this.rnohCoreContext?.isDebugModeEnabled) {
          RNOHErrorDialog({ ctx: this.rnohCoreContext });
        }
        RNApp({
          rnInstanceConfig: {
            name: 'JoplinHarmony',
            createRNPackages: getRNOHPackages,
            // @react-native-vector-icons renders glyphs with these font families.
            fontResourceByFontFamily: {
              'Ionicons': $rawfile('fonts/Ionicons.ttf'),
              'MaterialDesignIcons': $rawfile('fonts/MaterialDesignIcons.ttf'),
              'MaterialIcons': $rawfile('fonts/MaterialIcons.ttf'),
              'FontAwesome5Free-Solid': $rawfile('fonts/FontAwesome5_Solid.ttf'),
              'FontAwesome5Free-Regular': $rawfile('fonts/FontAwesome5_Regular.ttf'),
              'FontAwesome5Brands-Regular': $rawfile('fonts/FontAwesome5_Brands.ttf'),
            },
            enableDebugger: this.rnohCoreContext?.isDebugModeEnabled,
          },
          appKey: 'JoplinHarmony',
          jsBundleProvider: new TraceJSBundleProviderDecorator(
            new AnyJSBundleProvider([
              new MetroJSBundleProvider(),
              /**
               * NOTE: to load the bundle from file, place it in
               * `/data/app/el2/100/base/com.rnoh.tester/files/bundle.harmony.js`
               * on your device. The path mismatch is due to app sandboxing on OpenHarmony
               */
              new FileJSBundleProvider('/data/storage/el2/base/files/bundle.harmony.js'),
              new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'hermes_bundle.hbc'),
              new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'bundle.harmony.js')
            ]),
            this.rnohCoreContext.logger),
        });
      }
    }
    .height('100%')
    .width('100%')
  }
}
