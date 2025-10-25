module research_dao::research_dao {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use research_dao::simple_token;

    // ===== Errors =====
    const EInsufficientFunds: u64 = 0;
    const EProjectNotFound: u64 = 1;
    const ENotProjectOwner: u64 = 2;
    const EProjectAlreadyFunded: u64 = 3;

    // ===== Structs =====
    
    /// Araştırma projesi objesi
    public struct Project has key, store {
        id: UID,
        title: String,
        description: String,
        owner: address,
        funding_goal: u64, // MIST cinsinden (1 SUI = 1_000_000_000 MIST)
        current_funding: u64,
        timeline_months: u64,
        created_at: u64,
        is_funded: bool,
        funding_balance: Balance<SUI>,
        // Token bilgileri
        governance_token_amount: u64,
        article_token_amount: u64,
        governance_token_name: String,
        article_token_name: String,
        tokens_minted: bool,
    }

    /// DAO yönetimi için ana yapı
    public struct ResearchDAO has key {
        id: UID,
        total_projects: u64,
        total_funding: u64,
        admin: address,
    }

    /// Proje oluşturma eventi
    public struct ProjectCreated has copy, drop {
        project_id: ID,
        owner: address,
        title: String,
        funding_goal: u64,
        timeline_months: u64,
    }

    /// Fon sağlama eventi
    public struct ProjectFunded has copy, drop {
        project_id: ID,
        funder: address,
        amount: u64,
        total_funding: u64,
    }

    // ===== Init Function =====
    
    /// DAO'yu başlat
    fun init(ctx: &mut TxContext) {
        let dao = ResearchDAO {
            id: object::new(ctx),
            total_projects: 0,
            total_funding: 0,
            admin: tx_context::sender(ctx),
        };
        transfer::share_object(dao);
    }

    // ===== Public Functions =====

    /// Yeni araştırma projesi oluştur ve token'ları mint et
    public entry fun create_project_with_tokens(
        dao: &mut ResearchDAO,
        treasury_cap: &mut TreasuryCap<simple_token::SIMPLE_TOKEN>,
        title: vector<u8>,
        description: vector<u8>,
        funding_goal: u64,
        timeline_months: u64,
        governance_token_amount: u64,
        article_token_amount: u64,
        governance_token_name: vector<u8>,
        article_token_name: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let project_id = object::new(ctx);
        let project_id_copy = object::uid_to_inner(&project_id);
        let sender = tx_context::sender(ctx);
        
        let project = Project {
            id: project_id,
            title: string::utf8(title),
            description: string::utf8(description),
            owner: sender,
            funding_goal,
            current_funding: 0,
            timeline_months,
            created_at: clock::timestamp_ms(clock),
            is_funded: false,
            funding_balance: balance::zero(),
            governance_token_amount,
            article_token_amount,
            governance_token_name: string::utf8(governance_token_name),
            article_token_name: string::utf8(article_token_name),
            tokens_minted: true,
        };

        // DAO istatistiklerini güncelle
        dao.total_projects = dao.total_projects + 1;

        // Token'ları mint et
        simple_token::mint_project_tokens(
            treasury_cap,
            governance_token_amount,
            governance_token_name,
            governance_token_name, // symbol olarak da aynı ismi kullan
            article_token_amount,
            article_token_name,
            article_token_name, // symbol olarak da aynı ismi kullan
            sender,
            ctx
        );

        // Event emit et
        event::emit(ProjectCreated {
            project_id: project_id_copy,
            owner: sender,
            title: string::utf8(title),
            funding_goal,
            timeline_months,
        });

        // Projeyi gönderene transfer et
        transfer::transfer(project, sender);
    }

    /// Projeye fon sağla
    public entry fun fund_project(
        dao: &mut ResearchDAO,
        project: &mut Project,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        let payment_balance = coin::into_balance(payment);
        
        // Proje bilgilerini güncelle
        project.current_funding = project.current_funding + amount;
        balance::join(&mut project.funding_balance, payment_balance);
        
        // Hedef funding'e ulaşılmış mı kontrol et
        if (project.current_funding >= project.funding_goal) {
            project.is_funded = true;
        };

        // DAO istatistiklerini güncelle
        dao.total_funding = dao.total_funding + amount;

        // Event emit et
        event::emit(ProjectFunded {
            project_id: object::uid_to_inner(&project.id),
            funder: tx_context::sender(ctx),
            amount,
            total_funding: project.current_funding,
        });
    }

    /// Proje sahibi olarak fonları çek
    public entry fun withdraw_funds(
        project: &mut Project,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Sadece proje sahibi çekebilir
        assert!(project.owner == tx_context::sender(ctx), ENotProjectOwner);
        
        // Yeterli bakiye var mı kontrol et
        assert!(balance::value(&project.funding_balance) >= amount, EInsufficientFunds);
        
        // Fonu çek ve gönder
        let withdrawn_balance = balance::split(&mut project.funding_balance, amount);
        let withdrawn_coin = coin::from_balance(withdrawn_balance, ctx);
        transfer::public_transfer(withdrawn_coin, tx_context::sender(ctx));
    }

    // ===== View Functions =====

    /// Proje bilgilerini getir
    public fun get_project_info(project: &Project): (String, String, address, u64, u64, u64, bool, u64, u64, String, String) {
        (
            project.title,
            project.description,
            project.owner,
            project.funding_goal,
            project.current_funding,
            project.timeline_months,
            project.is_funded,
            project.governance_token_amount,
            project.article_token_amount,
            project.governance_token_name,
            project.article_token_name
        )
    }

    /// DAO istatistiklerini getir
    public fun get_dao_stats(dao: &ResearchDAO): (u64, u64, address) {
        (dao.total_projects, dao.total_funding, dao.admin)
    }

    /// Proje bakiyesini getir
    public fun get_project_balance(project: &Project): u64 {
        balance::value(&project.funding_balance)
    }

    // ===== Test Functions =====
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}