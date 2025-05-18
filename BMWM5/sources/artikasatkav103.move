module 0x6c949011b612d398bfe80a9307e3ade4ba61f6e6678451b4da5b35dad07c934a::artikasatkav103 {
    use std::signer;
    use std::string::{Self, String};
    use aptos_std::table::{Self, Table};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::randomness;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_token_objects::collection::{Self, Collection};
    use aptos_token_objects::token::{Self, Token};
    use aptos_token_objects::property_map;
    use aptos_token_objects::royalty;
    use std::vector;
    use std::option;
    use aptos_framework::event;
    use std::bcs;

    // Error constants
    const E_NO_NFTS_LEFT: u64 = 2;
    const E_NOT_TOKEN_OWNER: u64 = 3;
    const E_INVALID_CREATOR: u64 = 5;
    const E_ALREADY_VOTED: u64 = 6;
    const E_INVALID_CAR_INDEX: u64 = 7;
    const E_NOT_INITIALIZED: u64 = 10;
    const E_INSUFFICIENT_BALANCE: u64 = 12;

    // Contract constants
    const TOTAL_NFTS: u64 = 200;
    const MINT_PRICE: u64 = 100000; // 0.001 APT
    const CREATOR_ADDRESS: address = @0x6c949011b612d398bfe80a9307e3ade4ba61f6e6678451b4da5b35dad07c934a;
    const PAYMENT_ADDRESS: address = @0x5b3f0bddbe73339349524aa71aae345023d348d04e30bf9c776d338fb3e5471d;
    const COLLECTION_NAME: vector<u8> = b"CarNFT Collection APT";
    const COLLECTION_DESCRIPTION: vector<u8> = b"A collection of 200 unique Car NFTs";
    const COLLECTION_URI: vector<u8> = b"https://harlequin-petite-puma-951.mypinata.cloud/ipfs/QmQSzDYNNnhG5HkQeij9epE2etwS2Pp9jVqmcyWvQJRH24/_metadata.json";
    const TOKEN_PREFIX: vector<u8> = b"CarNFT #";
    const BASE_URI: vector<u8> = b"https://harlequin-petite-puma-951.mypinata.cloud/ipfs/QmQSzDYNNnhG5HkQeij9epE2etwS2Pp9jVqmcyWvQJRH24/";

    // Structure for managing the collection object
    struct CollectionOwnerObjConfig has key {
        collection_obj: Object<Collection>,
        extend_ref: object::ExtendRef,
    }

    // Structure for collection configuration
    struct CollectionConfig has key {
        collection_owner_obj: Object<CollectionOwnerObjConfig>,
        extend_ref: object::ExtendRef,
    }

    // Admin configuration
    struct Config has key {
        admin_addr: address,
    }

    // Structure for tracking minted NFTs
    struct MintedNFTs has key {
        available_nfts: vector<u64>,
        total_minted: u64,
        tokens: Table<u64, Object<Token>>,
        rarities: Table<u64, String>,
        token_owners: Table<u64, address>,
    }

    // Structure for voting
    struct Voting has key {
        ipfs_link: String,
        car_votes: Table<u64, u64>,
        votes_per_user: Table<address, u64>,
        total_cars: u64,
    }

    // Events for logging
    #[event]
    struct CreateCollectionEvent has store, drop {
        collection_owner_obj: Object<CollectionOwnerObjConfig>,
        collection_obj: Object<Collection>,
        max_supply: u64,
        name: String,
        description: String,
        uri: String,
    }

    #[event]
    struct MintNFTEvent has store, drop {
        recipient_addr: address,
        token_obj: Object<Token>,
        token_id: u64,
    }

    #[event]
    struct VoteCast has drop, store {
        voter: address,
        car_index: u64,
        remaining_votes: u64,
    }

    // Events for step-by-step logging
    #[event]
    struct InitializeStep has drop, store {
        step: String,
        signer_address: address,
    }

    #[event]
    struct MintNFTStep has drop, store {
        step: String,
        minter_address: address,
    }

    #[event]
    struct VoteStep has drop, store {
        step: String,
        voter_address: address,
    }

    // Module initialization during deployment
    fun init_module(sender: &signer) {
        move_to(sender, Config {
            admin_addr: signer::address_of(sender),
        });
    }

    // Helper function to convert u64 to string
    fun u64_to_string(num: u64): String {
        if (num == 0) {
            return string::utf8(b"0")
        };
        let bytes = vector::empty<u8>();
        let n = num;
        while (n > 0) {
            let digit = (n % 10) as u8;
            vector::push_back(&mut bytes, 48 + digit);
            n = n / 10;
        };
        vector::reverse(&mut bytes);
        string::utf8(bytes)
    }

    // Helper function to determine rarity based on token_id
    fun determine_rarity(token_id: u64): String {
        if (token_id <= 74) {
            string::utf8(b"Common")
        } else if (token_id <= 124) {
            string::utf8(b"Uncommon")
        } else if (token_id <= 164) {
            string::utf8(b"Rare")
        } else if (token_id <= 185) {
            string::utf8(b"Mysterious")
        } else if (token_id <= 195) {
            string::utf8(b"Epic")
        } else if (token_id <= 199) {
            string::utf8(b"Legendary")
        } else {
            string::utf8(b"Mythical")
        }
    }

    // Helper function to get weight based on rarity
    fun get_weight(rarity: &String): u64 {
        if (*rarity == string::utf8(b"Common")) { 1 }
        else if (*rarity == string::utf8(b"Uncommon")) { 2 }
        else if (*rarity == string::utf8(b"Rare")) { 4 }
        else if (*rarity == string::utf8(b"Mysterious")) { 6 }
        else if (*rarity == string::utf8(b"Epic")) { 10 }
        else if (*rarity == string::utf8(b"Legendary")) { 14 }
        else if (*rarity == string::utf8(b"Mythical")) { 20 }
        else { 0 }
    }

    // Helper function to determine attributes based on token_id
    fun get_background(token_id: u64): String {
        if (token_id % 3 == 0) {
            string::utf8(b"Background1")
        } else if (token_id % 3 == 1) {
            string::utf8(b"Background2")
        } else {
            string::utf8(b"Background3")
        }
    }

    fun get_car(token_id: u64): String {
        if (token_id % 3 == 0) {
            string::utf8(b"McLarenSenna")
        } else if (token_id % 3 == 1) {
            string::utf8(b"FerrariFXX")
        } else {
            string::utf8(b"LexusGSF")
        }
    }

    fun get_frame_color(token_id: u64): String {
        if (token_id % 3 == 0) {
            string::utf8(b"Blue")
        } else if (token_id % 3 == 1) {
            string::utf8(b"Green")
        } else {
            string::utf8(b"Red")
        }
    }

    fun get_stars(rarity: &String): String {
        if (*rarity == string::utf8(b"Common")) { string::utf8(b"1") }
        else if (*rarity == string::utf8(b"Uncommon")) { string::utf8(b"2") }
        else if (*rarity == string::utf8(b"Rare")) { string::utf8(b"3") }
        else if (*rarity == string::utf8(b"Mysterious")) { string::utf8(b"4") }
        else if (*rarity == string::utf8(b"Epic")) { string::utf8(b"5") }
        else if (*rarity == string::utf8(b"Legendary")) { string::utf8(b"6") }
        else { string::utf8(b"7") }
    }

    // Manual initialization of Config if it doesn't exist
    public entry fun initialize_config(account: &signer) {
        let signer_address = signer::address_of(account);
        assert!(signer_address == CREATOR_ADDRESS, E_INVALID_CREATOR);
        if (!exists<Config>(CREATOR_ADDRESS)) {
            move_to(account, Config {
                admin_addr: CREATOR_ADDRESS,
            });
        };
    }

    // Contract initialization with logging
    public entry fun initialize(account: &signer, ipfs_link: String, total_cars: u64) acquires Config {
        let signer_address = signer::address_of(account);

        event::emit(InitializeStep {
            step: string::utf8(b"Start initialize"),
            signer_address,
        });

        let config = borrow_global<Config>(CREATOR_ADDRESS);
        assert!(signer_address == config.admin_addr, E_INVALID_CREATOR);

        event::emit(InitializeStep {
            step: string::utf8(b"Config checked"),
            signer_address,
        });

        let collection_owner_obj_constructor_ref = &object::create_object(CREATOR_ADDRESS);
        let collection_owner_obj_signer = &object::generate_signer(collection_owner_obj_constructor_ref);

        let royalty = royalty::create(85, 1000, CREATOR_ADDRESS); // 8.5% royalty

        let collection_obj_constructor_ref = &collection::create_fixed_collection(
            collection_owner_obj_signer,
            string::utf8(COLLECTION_DESCRIPTION),
            TOTAL_NFTS,
            string::utf8(COLLECTION_NAME),
            option::some(royalty),
            string::utf8(COLLECTION_URI)
        );
        let collection_obj = object::object_from_constructor_ref<Collection>(collection_obj_constructor_ref);
        let transfer_ref = object::generate_transfer_ref(collection_obj_constructor_ref);
        object::enable_ungated_transfer(&transfer_ref);

        move_to(collection_owner_obj_signer, CollectionOwnerObjConfig {
            collection_obj,
            extend_ref: object::generate_extend_ref(collection_owner_obj_constructor_ref),
        });
        let collection_owner_obj = object::object_from_constructor_ref<CollectionOwnerObjConfig>(collection_owner_obj_constructor_ref);

        move_to(account, CollectionConfig {
            collection_owner_obj,
            extend_ref: object::generate_extend_ref(collection_obj_constructor_ref),
        });

        event::emit(InitializeStep {
            step: string::utf8(b"Collection created"),
            signer_address,
        });

        event::emit(CreateCollectionEvent {
            collection_owner_obj,
            collection_obj,
            max_supply: TOTAL_NFTS,
            name: string::utf8(COLLECTION_NAME),
            description: string::utf8(COLLECTION_DESCRIPTION),
            uri: string::utf8(COLLECTION_URI),
        });

        if (!exists<MintedNFTs>(CREATOR_ADDRESS)) {
            let available_nfts = vector::empty<u64>();
            let i = 1;
            while (i <= TOTAL_NFTS) {
                vector::push_back(&mut available_nfts, i);
                i = i + 1;
            };
            move_to(account, MintedNFTs {
                available_nfts,
                total_minted: 0,
                tokens: table::new(),
                rarities: table::new(),
                token_owners: table::new(),
            });
        };

        event::emit(InitializeStep {
            step: string::utf8(b"MintedNFTs initialized"),
            signer_address,
        });

        if (!exists<Voting>(CREATOR_ADDRESS)) {
            let car_votes = table::new();
            let votes_per_user = table::new();
            let i = 0;
            while (i < total_cars) {
                table::add(&mut car_votes, i, 0);
                i = i + 1;
            };
            move_to(account, Voting {
                ipfs_link,
                car_votes,
                votes_per_user,
                total_cars,
            });
        };

        event::emit(InitializeStep {
            step: string::utf8(b"Voting initialized"),
            signer_address,
        });

        event::emit(InitializeStep {
            step: string::utf8(b"Initialize completed"),
            signer_address,
        });
    }

    // Mint NFT with logging
    #[randomness]
    entry fun mint_nft(minter: &signer) acquires MintedNFTs, CollectionConfig, CollectionOwnerObjConfig {
        let minter_address = signer::address_of(minter);
        
        event::emit(MintNFTStep {
            step: string::utf8(b"Start mint_nft"),
            minter_address,
        });

        assert!(exists<MintedNFTs>(CREATOR_ADDRESS), E_NOT_INITIALIZED);
        let minted_nfts = borrow_global_mut<MintedNFTs>(CREATOR_ADDRESS);

        event::emit(MintNFTStep {
            step: string::utf8(b"MintedNFTs fetched"),
            minter_address,
        });

        assert!(coin::balance<AptosCoin>(minter_address) >= MINT_PRICE, E_INSUFFICIENT_BALANCE);
        assert!(minted_nfts.total_minted < TOTAL_NFTS, E_NO_NFTS_LEFT);

        event::emit(MintNFTStep {
            step: string::utf8(b"Minting checks passed"),
            minter_address,
        });

        coin::transfer<AptosCoin>(minter, PAYMENT_ADDRESS, MINT_PRICE);

        event::emit(MintNFTStep {
            step: string::utf8(b"Mint fee transferred"),
            minter_address,
        });

        let remaining_nfts = vector::length(&minted_nfts.available_nfts);
        let random_index = randomness::u64_range(0, remaining_nfts);
        let token_id = *vector::borrow(&mut minted_nfts.available_nfts, random_index);
        vector::remove(&mut minted_nfts.available_nfts, random_index);

        event::emit(MintNFTStep {
            step: string::utf8(b"NFT selected"),
            minter_address,
        });

        let collection_config = borrow_global<CollectionConfig>(CREATOR_ADDRESS);
        let collection_owner_obj = collection_config.collection_owner_obj;
        let collection_owner_config = borrow_global<CollectionOwnerObjConfig>(object::object_address(&collection_owner_obj));
        let collection_owner_obj_signer = &object::generate_signer_for_extending(&collection_owner_config.extend_ref);

        let token_name = string::utf8(TOKEN_PREFIX);
        string::append(&mut token_name, u64_to_string(token_id));
        let token_description = string::utf8(b"Aptos Trip Collection");
        let token_uri = string::utf8(BASE_URI);
        string::append(&mut token_uri, u64_to_string(token_id));
        string::append(&mut token_uri, string::utf8(b".json"));
        let token_id_str = u64_to_string(token_id);

        let rarity = determine_rarity(token_id);
        let background = get_background(token_id);
        let car = get_car(token_id);
        let frame_color = get_frame_color(token_id);
        let stars = get_stars(&rarity);

        event::emit(MintNFTStep {
            step: string::utf8(b"Token data prepared"),
            minter_address,
        });

        let constructor_ref = token::create(
            collection_owner_obj_signer,
            string::utf8(COLLECTION_NAME),
            token_description,
            token_name,
            option::none(),
            token_uri
        );

        let keys = vector[
            string::utf8(b"description"),
            string::utf8(b"Background"),
            string::utf8(b"Car"),
            string::utf8(b"RarityLabel"),
            string::utf8(b"FrameColor"),
            string::utf8(b"Stars"),
            string::utf8(b"id")
        ];
        let types = vector[
            string::utf8(b"0x1::string::String"),
            string::utf8(b"0x1::string::String"),
            string::utf8(b"0x1::string::String"),
            string::utf8(b"0x1::string::String"),
            string::utf8(b"0x1::string::String"),
            string::utf8(b"0x1::string::String"),
            string::utf8(b"0x1::string::String")
        ];
        let values = vector[
            bcs::to_bytes(&string::utf8(b"Aptos Trip Collection")),
            bcs::to_bytes(&background),
            bcs::to_bytes(&car),
            bcs::to_bytes(&rarity),
            bcs::to_bytes(&frame_color),
            bcs::to_bytes(&stars),
            bcs::to_bytes(&token_id_str)
        ];

        let properties = property_map::prepare_input(keys, types, values);
        property_map::init(&constructor_ref, properties);

        let token_obj = object::object_from_constructor_ref<token::Token>(&constructor_ref);
        object::transfer(collection_owner_obj_signer, token_obj, minter_address);

        event::emit(MintNFTStep {
            step: string::utf8(b"Token created and transferred"),
            minter_address,
        });

        table::add(&mut minted_nfts.rarities, token_id, rarity);
        table::add(&mut minted_nfts.tokens, token_id, token_obj);
        table::add(&mut minted_nfts.token_owners, token_id, minter_address);
        minted_nfts.total_minted = minted_nfts.total_minted + 1;

        event::emit(MintNFTStep {
            step: string::utf8(b"State updated"),
            minter_address,
        });

        event::emit(MintNFTEvent {
            recipient_addr: minter_address,
            token_obj,
            token_id,
        });

        event::emit(MintNFTStep {
            step: string::utf8(b"Mint completed"),
            minter_address,
        });
    }

    // Vote function with logging
    public entry fun vote(voter: &signer, car_index: u64) acquires Voting, MintedNFTs {
        let voter_addr = signer::address_of(voter);

        event::emit(VoteStep {
            step: string::utf8(b"Start vote"),
            voter_address: voter_addr,
        });

        let voting = borrow_global_mut<Voting>(CREATOR_ADDRESS);
        let minted_nfts = borrow_global<MintedNFTs>(CREATOR_ADDRESS);

        let nft_count = 0;
        let i = 1;
        while (i <= TOTAL_NFTS) {
            if (table::contains(&minted_nfts.tokens, i)) {
                let token_obj = table::borrow(&minted_nfts.tokens, i);
                if (object::is_owner(*token_obj, voter_addr)) {
                    nft_count = nft_count + 1;
                };
            };
            i = i + 1;
        };
        assert!(nft_count > 0, E_NOT_TOKEN_OWNER);

        event::emit(VoteStep {
            step: string::utf8(b"NFT count checked"),
            voter_address: voter_addr,
        });

        let votes_used = if (table::contains(&voting.votes_per_user, voter_addr)) {
            *table::borrow(&voting.votes_per_user, voter_addr)
        } else {
            0
        };
        assert!(votes_used < nft_count, E_ALREADY_VOTED);

        assert!(car_index < voting.total_cars, E_INVALID_CAR_INDEX);

        let current_votes = table::borrow_mut(&mut voting.car_votes, car_index);
        *current_votes = *current_votes + 1;

        if (table::contains(&voting.votes_per_user, voter_addr)) {
            let user_votes = table::borrow_mut(&mut voting.votes_per_user, voter_addr);
            *user_votes = *user_votes + 1;
        } else {
            table::add(&mut voting.votes_per_user, voter_addr, 1);
        };

        event::emit(VoteStep {
            step: string::utf8(b"Vote recorded"),
            voter_address: voter_addr,
        });

        let remaining_votes = nft_count - (votes_used + 1);

        event::emit(VoteCast {
            voter: voter_addr,
            car_index,
            remaining_votes,
        });

        event::emit(VoteStep {
            step: string::utf8(b"Vote completed"),
            voter_address: voter_addr,
        });
    }

    // Update IPFS link
    public entry fun update_ipfs_link(account: &signer, new_ipfs_link: String) acquires Voting, Config {
        let signer_address = signer::address_of(account);
        let config = borrow_global<Config>(CREATOR_ADDRESS);
        assert!(signer_address == config.admin_addr, E_INVALID_CREATOR);
        let voting = borrow_global_mut<Voting>(CREATOR_ADDRESS);
        voting.ipfs_link = new_ipfs_link;
    }

    // View functions
    #[view]
    public fun get_user_nfts(user: address): vector<vector<u64>> acquires MintedNFTs {
        let minted_nfts = borrow_global<MintedNFTs>(CREATOR_ADDRESS);
        let user_nfts = vector::empty<vector<u64>>();
        let i = 1;
        while (i <= TOTAL_NFTS) {
            if (table::contains(&minted_nfts.tokens, i)) {
                let token_obj = table::borrow(&minted_nfts.tokens, i);
                if (object::is_owner(*token_obj, user)) {
                    let rarity = table::borrow(&minted_nfts.rarities, i);
                    let weight = get_weight(rarity);
                    vector::push_back(&mut user_nfts, vector[i, weight]);
                };
            };
            i = i + 1;
        };
        user_nfts
    }

    #[view]
    public fun get_total_win_chance(user: address): u64 acquires MintedNFTs {
        let minted_nfts = borrow_global<MintedNFTs>(CREATOR_ADDRESS);
        let total_weight = 0;

        let total_count = 0;
        let rare_count = 0;
        let epic_count = 0;
        let legendary_count = 0;

        let i = 1;
        while (i <= TOTAL_NFTS) {
            if (table::contains(&minted_nfts.tokens, i)) {
                let token_obj = table::borrow(&minted_nfts.tokens, i);
                if (object::is_owner(*token_obj, user)) {
                    let rarity = table::borrow(&minted_nfts.rarities, i);
                    let weight = get_weight(rarity);
                    total_weight = total_weight + weight;

                    total_count = total_count + 1;
                    if (*rarity == string::utf8(b"Rare") || *rarity == string::utf8(b"Mysterious") ||
                        *rarity == string::utf8(b"Epic") || *rarity == string::utf8(b"Legendary") ||
                        *rarity == string::utf8(b"Mythical")) {
                        rare_count = rare_count + 1;
                    };
                    if (*rarity == string::utf8(b"Epic") || *rarity == string::utf8(b"Legendary") ||
                        *rarity == string::utf8(b"Mythical")) {
                        epic_count = epic_count + 1;
                    };
                    if (*rarity == string::utf8(b"Legendary") || *rarity == string::utf8(b"Mythical")) {
                        legendary_count = legendary_count + 1;
                    };
                };
            };
            i = i + 1;
        };

        let set_bonus_weight = 0;
        if (total_count >= 3) { 
            set_bonus_weight = set_bonus_weight + 4; 
        };
        if (total_count >= 5 && rare_count >= 2 && (total_count - rare_count) >= 1) { 
            set_bonus_weight = set_bonus_weight + 12; 
        };
        if (total_count >= 7 && legendary_count >= 1 && epic_count >= 2 && rare_count >= 3) { 
            set_bonus_weight = set_bonus_weight + 25; 
        };

        let wallet_weight = total_weight * 10 + set_bonus_weight; 

        let total_possible_set_bonus = (TOTAL_NFTS / 3) * 4 + 
                                     (TOTAL_NFTS / 5) * 12 + 
                                     (TOTAL_NFTS / 7) * 25;  
        let adjusted_total_weight = (74 * 1 + 50 * 2 + 40 * 4 + 21 * 6 + 10 * 10 + 4 * 14 + 1 * 20) * 10 + total_possible_set_bonus;

        let chance = (wallet_weight * 10000) / adjusted_total_weight;
        if (chance > 300) { 300 } else { chance }
    }

    #[view]
    public fun get_votes(car_index: u64): u64 acquires Voting {
        let voting = borrow_global<Voting>(CREATOR_ADDRESS);
        assert!(car_index < voting.total_cars, E_INVALID_CAR_INDEX);
        *table::borrow(&voting.car_votes, car_index)
    }

    #[view]
    public fun get_ipfs_link(): String acquires Voting {
        let voting = borrow_global<Voting>(CREATOR_ADDRESS);
        voting.ipfs_link
    }

    #[view]
    public fun get_collection_address(): address {
        collection::create_collection_address(&CREATOR_ADDRESS, &string::utf8(COLLECTION_NAME))
    }

    #[view]
    public fun is_initialized(): bool {
        exists<MintedNFTs>(CREATOR_ADDRESS)
    }

    #[view]
    public fun get_rarity(token_id: u64): String acquires MintedNFTs {
        let minted_nfts = borrow_global<MintedNFTs>(CREATOR_ADDRESS);
        assert!(token_id > 0 && token_id <= TOTAL_NFTS, E_INVALID_CAR_INDEX);
        assert!(table::contains(&minted_nfts.rarities, token_id), E_NOT_INITIALIZED);
        *table::borrow(&minted_nfts.rarities, token_id)
    }

    #[view]
    public fun get_remaining_votes(user: address): u64 acquires Voting, MintedNFTs {
        let voting = borrow_global<Voting>(CREATOR_ADDRESS);
        let minted_nfts = borrow_global<MintedNFTs>(CREATOR_ADDRESS);

        let nft_count = 0;
        let i = 1;
        while (i <= TOTAL_NFTS) {
            if (table::contains(&minted_nfts.tokens, i)) {
                let token_obj = table::borrow(&minted_nfts.tokens, i);
                if (object::is_owner(*token_obj, user)) {
                    nft_count = nft_count + 1;
                };
            };
            i = i + 1;
        };

        let votes_used = if (table::contains(&voting.votes_per_user, user)) {
            *table::borrow(&voting.votes_per_user, user)
        } else {
            0
        };

        if (nft_count > votes_used) {
            nft_count - votes_used
        } else {
            0
        }
    }
}