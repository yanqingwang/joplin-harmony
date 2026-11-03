/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {RNAbility, RNOHCoreContext} from '@rnoh/react-native-openharmony';
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

  // RNOH's RNAbility does not override UIAbility.onBackPressed, so the system
  // back gesture/key would just move the app to the background. Forward it to
  // the RN instances so BackButtonService handles it (close menu / NAV_BACK /
  // exitApp at the root), matching Android behaviour. Returning true keeps the
  // ability alive in background (per UIAbility.onBackPressed contract).
  override onBackPressed(): boolean {
    const coreContext = AppStorage.get<RNOHCoreContext>('RNOHCoreContext');
    if (coreContext) {
      coreContext.dispatchBackPress();
    }
    return true;
  }

  // Joplin's root back handler calls BackHandler.exitApp() when nothing is left
  // to navigate. RNOH's default implementation terminateSelf() destroys the
  // app; HarmonyOS convention is to keep it resident in the background.
  protected override defaultBackPressHandler() {
    this.context.moveAbilityToBackground();
  }

  override getPagePath() {
    return 'pages/Index';
  }

  override getRNOHWorkerScriptUrl() {
    return "entry/ets/workers/RNOHWorker.ets"
  }
}
