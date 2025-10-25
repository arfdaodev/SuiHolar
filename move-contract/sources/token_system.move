module research_dao::token_system {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::coin::{Self, TreasuryCap};
    use sui::url;
    use sui::event;
    use std::option;

    // ===== Errors =====
    const EInvalidAmount: u64 = 1;

    // ===== Token Structures =====

    /// TOKEN_SYSTEM one-time witness
    public struct TOKEN_SYSTEM has drop {}

    /// Token mint bilgileri
    public struct TokenMinted has copy, drop {
        token_type: String,
        recipient: address,
        amount: u64,
        project_id: String,
    }

    /// Coin metadata ile token bilgileri
    public struct TokenInfo has key, store {
        id: UID,
        name: String,
        symbol: String,
        description: String,
        icon_url: String,
        project_id: String,
        total_supply: u64,
    }

    // ===== Init Functions =====

    /// TOKEN_SYSTEM için one-time witness
    fun init(witness: TOKEN_SYSTEM, ctx: &mut TxContext) {
        // TOKEN_SYSTEM governance token'ını oluştur
        let (treasury_cap, metadata) = coin::create_currency<TOKEN_SYSTEM>(
            witness,
            9, // decimals
            b"PAPER",
            b"Paper Governance Token",
            b"Governance token for SuiHolar Research DAO",
            option::some(url::new_unsafe_from_bytes(b"https://suiholar.com/paper-icon.png")),
            ctx
        );

        // Treasury capability'yi transfer et (sadece admin kullanabilir)
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        transfer::public_freeze_object(metadata);
    }

    // ===== Public Functions =====

    /// PAPER governance token mint et
    public fun mint_paper_tokens(
        treasury_cap: &mut TreasuryCap<TOKEN_SYSTEM>,
        amount: u64,
        recipient: address,
        project_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, EInvalidAmount);
        
        let coins = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coins, recipient);

        // Event emit et
        event::emit(TokenMinted {
            token_type: string::utf8(b"PAPER"),
            recipient,
            amount,
            project_id: string::utf8(project_id),
        });
    }

    /// Article token için yeni currency oluştur ve mint et
    public fun create_and_mint_article_token(
        name: vector<u8>,
        symbol: vector<u8>,
        description: vector<u8>,
        icon_url: vector<u8>,
        amount: u64,
        recipient: address,
        project_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, EInvalidAmount);

        // Token bilgilerini sakla
        let token_info = TokenInfo {
            id: object::new(ctx),
            name: string::utf8(name),
            symbol: string::utf8(symbol),
            description: string::utf8(description),
            icon_url: string::utf8(icon_url),
            project_id: string::utf8(project_id),
            total_supply: amount,
        };

        // Token info'yu share et
        transfer::share_object(token_info);

        // Event emit et
        event::emit(TokenMinted {
            token_type: string::utf8(symbol),
            recipient,
            amount,
            project_id: string::utf8(project_id),
        });
    }

    /// Basit coin mint (SUI native coin olarak)
    public fun mint_simple_coin(
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, EInvalidAmount);
        
        // Basit bir coin objesi oluştur (test amaçlı)
        // Bu gerçek bir token değil, sadece obje transferi
        let token_info = TokenInfo {
            id: object::new(ctx),
            name: string::utf8(b"Article Token"),
            symbol: string::utf8(b"ART"),
            description: string::utf8(b"Research Article Token"),
            icon_url: string::utf8(b"https://suiholar.com/article-icon.png"),
            project_id: string::utf8(b"demo"),
            total_supply: amount,
        };

        transfer::transfer(token_info, recipient);
    }

    // ===== View Functions =====

    /// Token bilgilerini getir
    public fun get_token_info(token: &TokenInfo): (String, String, String, String, String, u64) {
        (
            token.name,
            token.symbol,
            token.description,
            token.icon_url,
            token.project_id,
            token.total_supply
        )
    }

    // ===== Test Functions =====
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        let witness = TOKEN_SYSTEM {};
        init(witness, ctx);
    }
}