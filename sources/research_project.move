/// Suiholar Research Project Module
/// Bu modül akademik makaleleri tokenlaştıran çift tokenli DAO yapısını destekler
module suiholar::research_project {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use std::string::String;
    use std::option;

    // === Errors ===
    const EInvalidStatus: u64 = 1;
    const EUnauthorized: u64 = 2;

    // === Project Status Constants ===
    const PROJECT_STATUS_DRAFT: u8 = 0;
    const PROJECT_STATUS_FUNDING: u8 = 1;
    const PROJECT_STATUS_RESEARCH: u8 = 2;
    const PROJECT_STATUS_PUBLISHED: u8 = 3;

    // === Token Structures ===
    
    /// PAPER_TOKEN: Ana yönetişim token'ı (IP Sahipliği)
    /// Bu token, araştırma projesinin fikri mülkiyet haklarını temsil eder
    public struct PAPER_TOKEN has drop {}

    /// COVAX_FINANCE_TOKEN: Araştırma projesine özel fonlama token'ı (Ön Satış/Fon Token'ı)
    /// Bu token, projenin finansmanı için kullanılır
    public struct COVAX_FINANCE_TOKEN has drop {}

    // === Main Project Object ===
    
    /// Project_Object: Sui'ye özgü ana proje nesnesi
    /// Bu nesne projenin tüm merkezi yetkilerini ve meta verilerini içerir
    public struct Project_Object has key {
        id: UID,
        /// Projenin başlığı
        title: String,
        /// Proje durumu (0: Taslak, 1: Fonlama, 2: Araştırma, 3: Yayınlandı)
        status: u8,
        /// IPFS/Walrus CID hash'i - proje verilerinin merkezi olmayan depolama adresi
        data_hash: vector<u8>,
        /// PAPER_TOKEN için yönetim yetkisi
        paper_treasury_cap: TreasuryCap<PAPER_TOKEN>,
        /// COVAX_FINANCE_TOKEN için yönetim yetkisi
        finance_treasury_cap: TreasuryCap<COVAX_FINANCE_TOKEN>,
    }

    // === Project Creation Function ===
    
    /// create_project: Yeni bir araştırma projesi oluşturur
    /// 
    /// Parameters:
    /// - title: Projenin başlığı
    /// - data_hash: IPFS/Walrus CID hash'i
    /// - paper_initial_supply: PAPER_TOKEN başlangıç arzı (varsayılan: 1,000,000)
    /// - finance_initial_supply: COVAX_FINANCE_TOKEN başlangıç arzı
    /// - ctx: İşlem bağlamı
    /// 
    /// Bu fonksiyon:
    /// 1. Her iki token tipini oluşturur
    /// 2. Başlangıç token arzını basar
    /// 3. Project_Object'i oluşturup çağıranı (tx_context::sender) sahibi olarak atar
    public fun create_project(
        title: String,
        data_hash: vector<u8>,
        paper_initial_supply: u64,
        finance_initial_supply: u64,
        ctx: &mut TxContext
    ) {
        // PAPER_TOKEN oluştur ve treasury cap'ini al
        let (paper_treasury_cap, paper_metadata) = coin::create_currency<PAPER_TOKEN>(
            PAPER_TOKEN {},
            9, // decimals
            b"PAPER",
            b"Paper Token",
            b"IP Ownership Token for Research Projects",
            option::none(),
            ctx
        );

        // COVAX_FINANCE_TOKEN oluştur ve treasury cap'ini al
        let (finance_treasury_cap, finance_metadata) = coin::create_currency<COVAX_FINANCE_TOKEN>(
            COVAX_FINANCE_TOKEN {},
            9, // decimals
            b"COVAX",
            b"Covax Finance Token",
            b"Funding Token for Research Projects",
            option::none(),
            ctx
        );

        // Metadata'ları paylaş (public olarak erişilebilir yapar)
        transfer::public_freeze_object(paper_metadata);
        transfer::public_freeze_object(finance_metadata);

        // Başlangıç PAPER token arzını bas
        let paper_coins = coin::mint<PAPER_TOKEN>(
            &mut paper_treasury_cap,
            paper_initial_supply,
            ctx
        );

        // Başlangıç COVAX_FINANCE token arzını bas
        let finance_coins = coin::mint<COVAX_FINANCE_TOKEN>(
            &mut finance_treasury_cap,
            finance_initial_supply,
            ctx
        );

        // Project_Object'i oluştur
        let project = Project_Object {
            id: object::new(ctx),
            title,
            status: PROJECT_STATUS_DRAFT,
            data_hash,
            paper_treasury_cap,
            finance_treasury_cap,
        };

        let sender = tx_context::sender(ctx);

        // Basılan tokenları proje sahibine transfer et
        transfer::public_transfer(paper_coins, sender);
        transfer::public_transfer(finance_coins, sender);

        // Project_Object'i proje sahibine transfer et
        transfer::transfer(project, sender);
    }

    // === Getter Functions ===
    
    /// Proje başlığını döndürür
    public fun get_title(project: &Project_Object): &String {
        &project.title
    }

    /// Proje durumunu döndürür
    public fun get_status(project: &Project_Object): u8 {
        project.status
    }

    /// Proje data hash'ini döndürür
    public fun get_data_hash(project: &Project_Object): &vector<u8> {
        &project.data_hash
    }

    // === Project Management Functions ===
    
    /// Proje durumunu günceller (sadece proje sahibi)
    public fun update_status(project: &mut Project_Object, new_status: u8) {
        assert!(new_status <= PROJECT_STATUS_PUBLISHED, EInvalidStatus);
        project.status = new_status;
    }

    /// Proje data hash'ini günceller (sadece proje sahibi)
    public fun update_data_hash(project: &mut Project_Object, new_data_hash: vector<u8>) {
        project.data_hash = new_data_hash;
    }

    // === Token Minting Functions ===
    
    /// PAPER_TOKEN basar (sadece proje sahibi)
    public fun mint_paper_tokens(
        project: &mut Project_Object,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<PAPER_TOKEN> {
        coin::mint(&mut project.paper_treasury_cap, amount, ctx)
    }

    /// COVAX_FINANCE_TOKEN basar (sadece proje sahibi)
    public fun mint_finance_tokens(
        project: &mut Project_Object,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<COVAX_FINANCE_TOKEN> {
        coin::mint(&mut project.finance_treasury_cap, amount, ctx)
    }

    // === Utility Functions ===
    
    /// Proje durumu sabitlerini döndüren yardımcı fonksiyonlar
    public fun status_draft(): u8 { PROJECT_STATUS_DRAFT }
    public fun status_funding(): u8 { PROJECT_STATUS_FUNDING }
    public fun status_research(): u8 { PROJECT_STATUS_RESEARCH }
    public fun status_published(): u8 { PROJECT_STATUS_PUBLISHED }
}