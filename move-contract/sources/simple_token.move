module research_dao::simple_token {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url;
    use sui::event;
    use std::option;

    // ===== Token Structures =====

    /// Simple Token one-time witness
    public struct SIMPLE_TOKEN has drop {}

    /// Token mint eventi
    public struct TokenMinted has copy, drop {
        token_name: String,
        recipient: address,
        amount: u64,
    }

    /// Kullanıcı token bilgisi
    public struct UserToken has key, store {
        id: UID,
        name: String,
        symbol: String,
        amount: u64,
        owner: address,
    }

    // ===== Init Function =====
    fun init(witness: SIMPLE_TOKEN, ctx: &mut TxContext) {
        // Simple token currency oluştur
        let (treasury_cap, metadata) = coin::create_currency<SIMPLE_TOKEN>(
            witness,
            9, // decimals
            b"PAPER",
            b"Paper Research Token",
            b"Simple token for SuiHolar Research DAO",
            option::some(url::new_unsafe_from_bytes(b"https://suiholar.com/token-icon.png")),
            ctx
        );

        // Treasury'yi share et - herkes mint edebilsin
        transfer::public_share_object(treasury_cap);
        transfer::public_freeze_object(metadata);
    }

    // ===== Public Functions =====

    /// Basit token mint et
    public entry fun mint_token(
        treasury_cap: &mut TreasuryCap<SIMPLE_TOKEN>,
        amount: u64,
        name: vector<u8>,
        symbol: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, 1);
        
        // Coin mint et
        let coins = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coins, recipient);

        // UserToken objesi de oluştur
        let user_token = UserToken {
            id: object::new(ctx),
            name: string::utf8(name),
            symbol: string::utf8(symbol),
            amount,
            owner: recipient,
        };
        transfer::transfer(user_token, recipient);

        // Event emit et
        event::emit(TokenMinted {
            token_name: string::utf8(name),
            recipient,
            amount,
        });
    }

    /// Birden fazla token mint et (proje oluşturma için)
    public entry fun mint_project_tokens(
        treasury_cap: &mut TreasuryCap<SIMPLE_TOKEN>,
        governance_amount: u64,
        governance_name: vector<u8>,
        governance_symbol: vector<u8>,
        article_amount: u64,
        article_name: vector<u8>,
        article_symbol: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // Governance token mint et
        if (governance_amount > 0) {
            mint_token(
                treasury_cap,
                governance_amount,
                governance_name,
                governance_symbol,
                recipient,
                ctx
            );
        };

        // Article token mint et
        if (article_amount > 0) {
            mint_token(
                treasury_cap,
                article_amount,
                article_name,
                article_symbol,
                recipient,
                ctx
            );
        };
    }

    // ===== View Functions =====
    public fun get_token_info(token: &UserToken): (String, String, u64, address) {
        (token.name, token.symbol, token.amount, token.owner)
    }

    // ===== Test Functions =====
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        let witness = SIMPLE_TOKEN {};
        init(witness, ctx);
    }
}