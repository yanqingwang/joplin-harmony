/**
 * The RNOH webview HAR was built against RNOH 0.72, where custom ArkTS
 * components were created through RNApp's buildCustomComponent. 0.86 expects a
 * package to publish them via createWrappedCustomRNComponentBuilderByComponentNameMap,
 * otherwise the RNCWebView descriptor is created but never rendered.
 */

import { ComponentBuilderContext } from '@rnoh/react-native-openharmony';
import { RNCWebView, RNCWebViewPackage } from '@react-native-oh-tpl/react-native-webview';

@Builder
function buildRNCWebView(ctx: ComponentBuilderContext) {
  RNCWebView({
    ctx: ctx.rnComponentContext,
    tag: ctx.tag,
  })
}

export class JoplinWebViewPackage extends RNCWebViewPackage {
  override createWrappedCustomRNComponentBuilderByComponentNameMap(): Map<string, WrappedBuilder<[ComponentBuilderContext]>> {
    return new Map().set(RNCWebView.NAME, wrapBuilder(buildRNCWebView));
  }
}
