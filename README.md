# 💰 Gelir Gider Takip - Mobil Uygulama

Bu proje, kullanıcıların kişisel finanslarını yönetmelerine, harcamalarını takip etmelerine ve yapay zeka destekli finansal analizler almalarına olanak tanıyan modern bir mobil uygulamadır. **React Native** ve **Expo** kullanılarak geliştirilmiştir.

## ✨ Özellikler

*   **📊 Dashboard:** Finansal durumunuzun genel özeti, toplam bakiye, gelir ve gider grafikeri.
*   **🤖 AI Finansal Analiz:** Google Gemini AI entegrasyonu ile harcama alışkanlıklarınızın analizi ve kişiselleştirilmiş finansal tavsiyeler.
*   **💸 İşlem Takibi:** Hızlı ve kolay bir şekilde gelir ve gider ekleme, kategorize etme.
*   **📅 Ödemeler:** Yaklaşan faturalar ve düzenli ödemelerin takvim görünümüyle takibi.
*   **🎯 Bütçe Yönetimi:** Kategorilere göre bütçe limitleri belirleme ve doluluk oranlarını takip etme.
*   **🎨 Premium Tasarım:** Modern, karanlık tema destekli, cam morfizmi (glassmorphism) efektleri ve akıcı animasyonlar içeren kullanıcı arayüzü.

## 🚀 Teknolojiler

*   **Frontend:** React Native, Expo
*   **State Management:** Zustand
*   **Backend:** Supabase (Veritabanı & Kimlik Doğrulama)
*   **AI:** Google Generative AI (Gemini)
*   **UI/UX:** Lucide React Native (İkonlar), React Native Reanimated, Expo Linear Gradient
*   **Grafikler:** React Native SVG tabanlı özel grafik bileşenleri

## 🛠️ Kurulum

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/sametevlice/gelir-gider-takip-mobil.git
    cd gelir-gider-takip-mobil
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    Kök dizinde bir `.env` dosyası oluşturun ve aşağıdaki bilgileri doldurun:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    npx expo start
    ```

## 📱 Ekran Görüntüleri

*(Ekran görüntüleri buraya eklenebilir)*

---

Geliştiren: [Samet Evlice](https://github.com/sametevlice)