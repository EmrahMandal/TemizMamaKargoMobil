package com.zmobilreact.app

import android.annotation.SuppressLint
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import okhttp3.OkHttpClient
import com.facebook.react.modules.network.OkHttpClientProvider
import com.facebook.react.modules.network.ReactCookieJarContainer
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.TimeUnit
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

/**
 * DEBUG ONLY — Installs a trust-all OkHttp client into RCTNetworking.
 *
 * Neden gerekli:
 * Android emülatöründe Chrome Custom Tab kapandıktan sonra yapılan HTTPS
 * istekleri "Network request failed" hatası verir. Bunun sebebi OkHttp'nin
 * TLS sertifika doğrulama zincirini tamamlayamamasıdır (emülatör CA store'u
 * güncel olmayabilir veya sunucu ara sertifikayı göndermeyebilir).
 *
 * Bu paket yalnızca BuildConfig.DEBUG == true olduğunda etkinleşir.
 * Production build'larda hiçbir etkisi yoktur.
 */
class TrustAllSSLPackage : ReactPackage {

    companion object {
        @SuppressLint("CustomX509TrustManager", "TrustAllX509TrustManager")
        fun install() {
            if (!BuildConfig.DEBUG) return  // Sadece debug build'da çalış

            val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
                @SuppressLint("TrustAllX509TrustManager")
                override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
                @SuppressLint("TrustAllX509TrustManager")
                override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
                override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            })

            val sslContext = SSLContext.getInstance("TLS")
            sslContext.init(null, trustAllCerts, SecureRandom())
            val sslSocketFactory = sslContext.socketFactory
            val trustManager = trustAllCerts[0] as X509TrustManager

            OkHttpClientProvider.setOkHttpClientFactory {
                OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .cookieJar(ReactCookieJarContainer())
                    .sslSocketFactory(sslSocketFactory, trustManager)
                    .hostnameVerifier { _, _ -> true }
                    .build()
            }
        }
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> = emptyList()
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
