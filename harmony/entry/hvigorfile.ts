// Copyright (c) 2025 Huawei Technologies Co., Ltd.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import { hapTasks } from '@ohos/hvigor-ohos-plugin';
import { createRNOHModulePlugin } from '@rnoh/hvigor-plugin';

export default {
	system: hapTasks,
	plugins: [
		createRNOHModulePlugin({
			// node_modules is a symlink to the JS workspace (harmony-shell), which
			// keeps the RNOH codegen output inside this project instead of writing
			// into the Joplin monorepo root.
			nodeModulesPath: './node_modules',
			codegen: {
				rnohModulePath: './oh_modules/@rnoh/react-native-openharmony',
				projectRootPath: '../harmony-shell',
			},
		}),
	],
};
