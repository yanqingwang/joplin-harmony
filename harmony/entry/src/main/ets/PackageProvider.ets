/**
 * Copyright (c) 2025 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RNPackage, RNPackageContext } from '@rnoh/react-native-openharmony';
import { createRNOHPackages as createRNOHPackagesAutolinking } from './RNOHPackagesFactory';
import { JoplinPackage } from './joplin/JoplinPackage';
// RNOH's webview HAR exposes a named export, which autolinking cannot import,
// so it is registered by hand (see WebViewCompatPackage).
import { JoplinWebViewPackage } from './joplin/WebViewCompatPackage';

export function getRNOHPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    ...createRNOHPackagesAutolinking(ctx),
    new JoplinWebViewPackage(ctx),
    new JoplinPackage(ctx)
  ];
}
