package com.flux.panel;

  import android.graphics.Color;
  import android.os.Bundle;
  import android.view.View;
  import android.webkit.WebChromeClient;
  import android.webkit.WebResourceRequest;
  import android.webkit.WebSettings;
  import android.webkit.WebView;
  import android.webkit.WebViewClient;
  import android.widget.FrameLayout;
  import android.widget.ProgressBar;
  import android.widget.RelativeLayout;
  import android.widget.TextView;
  import androidx.appcompat.app.AppCompatActivity;

  public class MainActivity extends AppCompatActivity {

      private static final String PANEL_URL = "https://panel-8bp.vercel.app";
      private WebView webView;
      private ProgressBar progressBar;

      @Override
      protected void onCreate(Bundle savedInstanceState) {
          super.onCreate(savedInstanceState);

          FrameLayout root = new FrameLayout(this);
          root.setBackgroundColor(0xFF07090F);

          // WebView
          webView = new WebView(this);
          FrameLayout.LayoutParams wvParams = new FrameLayout.LayoutParams(
                  FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT);
          webView.setLayoutParams(wvParams);
          webView.setBackgroundColor(0xFF07090F);

          WebSettings ws = webView.getSettings();
          ws.setJavaScriptEnabled(true);
          ws.setDomStorageEnabled(true);
          ws.setLoadWithOverviewMode(true);
          ws.setUseWideViewPort(true);
          ws.setBuiltInZoomControls(false);
          ws.setSupportZoom(false);
          ws.setCacheMode(WebSettings.LOAD_DEFAULT);
          ws.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
          ws.setUserAgentString("FluxPanel/1.0 Android/" + android.os.Build.VERSION.RELEASE);

          webView.setWebViewClient(new WebViewClient() {
              @Override
              public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                  return false;
              }
              @Override
              public void onPageFinished(WebView view, String url) {
                  progressBar.setVisibility(View.GONE);
              }
              @Override
              public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                  // Show friendly error page
                  view.loadData(
                      "<html><body style='background:#07090f;color:#ef4444;font-family:monospace;text-align:center;padding:40px'>" +
                      "<h2>Connection Error</h2><p>" + description + "</p>" +
                      "<p style='color:#64748b'>Retry: <a style='color:#00c8ff' href='" + PANEL_URL + "'>" + PANEL_URL + "</a></p></body></html>",
                      "text/html", "utf-8"
                  );
              }
          });

          webView.setWebChromeClient(new WebChromeClient() {
              @Override
              public void onProgressChanged(WebView view, int newProgress) {
                  progressBar.setProgress(newProgress);
                  progressBar.setVisibility(newProgress < 100 ? View.VISIBLE : View.GONE);
              }
          });

          // Progress bar (cyan, top)
          progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
          FrameLayout.LayoutParams pbParams = new FrameLayout.LayoutParams(
                  FrameLayout.LayoutParams.MATCH_PARENT, 6);
          progressBar.setLayoutParams(pbParams);
          progressBar.setMax(100);
          progressBar.setProgressTintList(android.content.res.ColorStateList.valueOf(0xFF00C8FF));
          progressBar.setBackgroundColor(0xFF0D1117);

          root.addView(webView);
          root.addView(progressBar);
          setContentView(root);

          webView.loadUrl(PANEL_URL);
      }

      @Override
      public void onBackPressed() {
          if (webView != null && webView.canGoBack()) {
              webView.goBack();
          } else {
              super.onBackPressed();
          }
      }

      @Override
      protected void onResume() {
          super.onResume();
          if (webView != null) webView.onResume();
      }

      @Override
      protected void onPause() {
          super.onPause();
          if (webView != null) webView.onPause();
      }

      @Override
      protected void onDestroy() {
          if (webView != null) {
              webView.stopLoading();
              webView.destroy();
              webView = null;
          }
          super.onDestroy();
      }
  }
  