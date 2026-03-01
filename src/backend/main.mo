import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Random "mo:core/Random";
import Migration "migration";

(with migration = Migration.run)
actor {
  module Category {
    public type Category = {
      id : Nat;
      name : Text;
      slug : Text;
    };
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      switch (Nat.compare(category1.id, category2.id)) {
        case (#equal) { Text.compare(category1.slug, category2.slug) };
        case (order) { order };
      };
    };
  };
  type Category = Category.Category;

  module Channel {
    public type Channel = {
      id : Nat;
      name : Text;
      logoUrl : Text;
      streamUrl : Text;
      category : Text;
      description : Text;
      isActive : Bool;
      order : Nat;
    };
    public func compare(channel1 : Channel, channel2 : Channel) : Order.Order {
      Nat.compare(channel1.order, channel2.order);
    };
  };
  type Channel = Channel.Channel;

  let categories = Map.empty<Nat, Category>();
  let channels = Map.empty<Nat, Channel>();
  let activeSessions = Set.empty<Text>();

  // Seed Data
  func seedCategories() {
    categories.add(
      1,
      { id = 1; name = "Bangla TV"; slug = "bangla-tv" },
    );
    categories.add(
      2,
      { id = 2; name = "Radio"; slug = "radio" },
    );
    categories.add(
      3,
      { id = 3; name = "News"; slug = "news" },
    );
    categories.add(
      4,
      { id = 4; name = "International"; slug = "international" },
    );
  };

  func seedChannels() {
    channels.add(
      1,
      {
        id = 1;
        name = "ATN Bangla";
        logoUrl = "https://example.com/atn-logo.png";
        streamUrl = "https://placeholder.com/atn-stream.m3u8";
        category = "bangla-tv";
        description = "Popular Bangla entertainment channel";
        isActive = true;
        order = 1;
      },
    );
    channels.add(
      2,
      {
        id = 2;
        name = "Radio Foorti";
        logoUrl = "https://example.com/foorti-logo.png";
        streamUrl = "https://placeholder.com/foorti-stream.m3u8";
        category = "radio";
        description = "Top radio station in Bangladesh";
        isActive = true;
        order = 2;
      },
    );
    channels.add(
      3,
      {
        id = 3;
        name = "BBC News";
        logoUrl = "https://example.com/bbc-logo.png";
        streamUrl = "https://placeholder.com/bbc-stream.m3u8";
        category = "news";
        description = "International news coverage";
        isActive = true;
        order = 3;
      },
    );
    channels.add(
      4,
      {
        id = 4;
        name = "CNN International";
        logoUrl = "https://example.com/cnn-logo.png";
        streamUrl = "https://placeholder.com/cnn-stream.m3u8";
        category = "international";
        description = "24/7 international news channel";
        isActive = true;
        order = 4;
      },
    );
  };

  // Initialize
  seedCategories();
  seedChannels();

  // Auth
  let adminUsername = "admin";
  let adminPassword = "147852";

  public query ({ caller }) func validateSession(token : Text) : async Bool {
    activeSessions.contains(token);
  };

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    if (username != adminUsername or password != adminPassword) {
      do { Runtime.trap("Authentication failed!") };
    };
    let random = Random.crypto();
    let token = await* random.nat64();
    let sessionToken = token.toText();
    activeSessions.add(sessionToken);
    sessionToken;
  };

  public shared ({ caller }) func adminLogout(token : Text) : async Bool {
    if (not activeSessions.contains(token)) {
      Runtime.trap("Invalid session token!");
    };
    activeSessions.remove(token);
    true;
  };

  // Categories CRUD
  public shared ({ caller }) func addCategory(category : Category, token : Text) : async () {
    requireAuth(token);
    categories.add(category.id, category);
  };

  public shared ({ caller }) func updateCategory(category : Category, token : Text) : async () {
    requireAuth(token);
    switch (categories.get(category.id)) {
      case (null) { Runtime.trap("Category not found!") };
      case (?_) {
        categories.add(category.id, category);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat, token : Text) : async () {
    requireAuth(token);
    if (not categories.containsKey(id)) {
      Runtime.trap("Category not found!");
    };
    categories.remove(id);
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  // Channels CRUD
  public shared ({ caller }) func addChannel(channel : Channel, token : Text) : async () {
    requireAuth(token);
    channels.add(channel.id, channel);
  };

  public shared ({ caller }) func updateChannel(channel : Channel, token : Text) : async () {
    requireAuth(token);
    switch (channels.get(channel.id)) {
      case (null) { Runtime.trap("Channel not found!") };
      case (?_) {
        channels.add(channel.id, channel);
      };
    };
  };

  public shared ({ caller }) func deleteChannel(id : Nat, token : Text) : async () {
    requireAuth(token);
    if (not channels.containsKey(id)) {
      Runtime.trap("Channel not found!");
    };
    channels.remove(id);
  };

  public query ({ caller }) func getChannels() : async [Channel] {
    channels.values().toArray().filter(func(c) { c.isActive }).sort();
  };

  // New query for all channels (including inactive) for admins
  public query ({ caller }) func getAllChannels(token : Text) : async [Channel] {
    requireAuth(token);
    channels.values().toArray().sort();
  };

  public query ({ caller }) func getChannelById(id : Nat) : async Channel {
    switch (channels.get(id)) {
      case (null) { Runtime.trap("Channel not found!") };
      case (?channel) { channel };
    };
  };

  public query ({ caller }) func getChannelsByCategory(categorySlug : Text) : async [Channel] {
    channels.values().toArray().filter(func(c) { c.isActive and c.category == categorySlug }).sort();
  };

  // Helper
  func requireAuth(token : Text) {
    if (not activeSessions.contains(token)) {
      Runtime.trap("Unauthorized operation!");
    };
  };
};
