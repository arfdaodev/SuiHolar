module research_dao::research_dao {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::table::{Self, Table};

    // ===== Errors =====
    const EInsufficientFunds: u64 = 0;
    const EProjectNotFound: u64 = 1;
    const ENotProjectOwner: u64 = 2;
    const EProjectAlreadyFunded: u64 = 3;
    const EInvestmentExceedsLimit: u64 = 4; // New error for funding limit
    const EZeroFundingGoal: u64 = 5; // New error for division by zero

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
        investors: Table<address, u64>, // Maps investor address to their invested amount
        walrus_blob_id: String, // ID for the encrypted file on Walrus
        seal_policy_id: String, // ID for the access policy on Seal Protocol
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
    }

    /// Fon sağlama eventi
    public struct ProjectFunded has copy, drop {
        project_id: ID,
        funder: address,
        amount: u64,
        total_invested_by_funder: u64,
        total_funding_for_project: u64,
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

    /// Yeni araştırma projesi oluştur
    public entry fun create_research_project(
        dao: &mut ResearchDAO,
        title: vector<u8>,
        description: vector<u8>,
        funding_goal: u64,
        timeline_months: u64,
        walrus_blob_id: vector<u8>,
        seal_policy_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let project = Project {
            id: object::new(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            owner: sender,
            funding_goal,
            current_funding: 0,
            timeline_months,
            created_at: clock::timestamp_ms(clock),
            is_funded: false,
            funding_balance: balance::zero(),
            investors: table::new(ctx),
            walrus_blob_id: string::utf8(walrus_blob_id),
            seal_policy_id: string::utf8(seal_policy_id),
        };

        dao.total_projects = dao.total_projects + 1;

        event::emit(ProjectCreated {
            project_id: object::id(&project),
            owner: sender,
            title: project.title,
            funding_goal,
        });

        transfer::transfer(project, sender);
    }

    /// Projeye fon sağla (Yatırım yap)
    public entry fun invest(
        project: &mut Project,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let investor = tx_context::sender(ctx);
        let amount = coin::value(&payment);
        let payment_balance = coin::into_balance(payment);
        
        // Yatırımcının mevcut yatırımını al
        let current_investment = if (table::contains(&project.investors, investor)) {
            *table::borrow(&project.investors, investor)
        } else {
            0
        };

        let new_total_investment = current_investment + amount;

        // KURAL: Yatırımcının toplam yatırımı, fonlama hedefinin %50'sini geçemez.
        // (new_total_investment * 100) / funding_goal <= 50  => new_total_investment * 2 <= funding_goal
        assert!(new_total_investment * 2 <= project.funding_goal, EInvestmentExceedsLimit);

        // Yatırımcı tablosunu güncelle
        if (table::contains(&project.investors, investor)) {
            let investor_balance = table::borrow_mut(&mut project.investors, investor);
            *investor_balance = new_total_investment;
        } else {
            table::add(&mut project.investors, investor, new_total_investment);
        };

        // Proje bilgilerini güncelle
        project.current_funding = project.current_funding + amount;
        balance::join(&mut project.funding_balance, payment_balance);
        
        if (project.current_funding >= project.funding_goal) {
            project.is_funded = true;
        };

        event::emit(ProjectFunded {
            project_id: object::id(project),
            funder: investor,
            amount,
            total_invested_by_funder: new_total_investment,
            total_funding_for_project: project.current_funding,
        });
    }

    /// Proje sahibi olarak fonları çek
    public entry fun withdraw_funds(
        project: &mut Project,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(project.owner == tx_context::sender(ctx), ENotProjectOwner);
        assert!(balance::value(&project.funding_balance) >= amount, EInsufficientFunds);
        
        let withdrawn_balance = balance::split(&mut project.funding_balance, amount);
        let withdrawn_coin = coin::from_balance(withdrawn_balance, ctx);
        transfer::public_transfer(withdrawn_coin, tx_context::sender(ctx));
    }

    // ===== View Functions =====

    /// Yatırımcının yetkili olup olmadığını (yatırım oranını) kontrol et.
    /// Seal Protocol gibi dış servisler tarafından çağrılabilir.
    public fun is_authorized_investor(project: &Project, investor: address): u64 {
        assert!(project.funding_goal > 0, EZeroFundingGoal);

        let investment = if (table::contains(&project.investors, investor)) {
            *table::borrow(&project.investors, investor)
        } else {
            0
        };

        // Yatırımcının yaptığı yatırımın toplam hedefe oranını yüzde olarak döndür.
        // Yüzdeyi daha hassas hesaplamak için önce 10000 ile çarpıp sonra 100'e bölebiliriz (2 ondalık basamak).
        (investment * 100) / project.funding_goal
    }
}