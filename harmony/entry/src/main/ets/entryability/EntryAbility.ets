/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {RNAbility} from '@rnoh/react-native-openharmony';
import {webview} from '@kit.ArkWeb';
import {AbilityConstant, Want} from '@kit.AbilityKit';

export default class EntryAbility extends RNAbility {
  override onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    super.onCreate(want, launchParam);
    // RNOH's HttpClient writes through WebCookieManager on the JS thread, which
    // initializes ArkWeb off the UI thread and leaves the engine unable to
    // create a browser. Initializing it here first keeps that path healthy.
    webview.WebviewController.initializeWebEngine();
  }

  override getPagePath() {
    return 'pages/Index';
  }

  override getRNOHWorkerScriptUrl() {
    return "entry/ets/workers/RNOHWorker.ets"
  }
}
