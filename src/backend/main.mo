import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Set "mo:core/Set";



actor {
  // Types
  type AuthResult = {
    username : Text;
    role : Text;
  };

  type Account = {
    id : Nat;
    username : Text;
    password : Text;
    role : Text;
  };

  type SiteSettings = {
    siteName : Text;
    tagline : Text;
    logoUrl : Text;
    contactEmail : Text;
    footerText : Text;
    maintenanceMode : Bool;
  };

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

  type Session = {
    id : Text;
    username : Text;
    role : Text;
  };
  type Category = Category.Category;
  type Channel = Channel.Channel;
  type ApiSettings = {
    enabled : Bool;
    apiToken : Text;
  };
  type ChannelImport = {
    name : Text;
    logoUrl : Text;
    streamUrl : Text;
    category : Text;
    description : Text;
    isActive : Bool;
    order : Nat;
  };

  // Data Storage
  let accounts = Map.empty<Text, Account>();
  let channels = Map.empty<Text, Channel>();
  let categories = Map.empty<Text, Category>();
  let sessions = Map.empty<Text, Session>();
  var settings : SiteSettings = {
    siteName = "jagolive";
    tagline = "Watch Live TV Online Free";
    logoUrl = "";
    contactEmail = "";
    footerText = "jagolive 2024";
    maintenanceMode = false;
  };
  var apiSettings : ApiSettings = {
    enabled = false;
    apiToken = "jagolive-api-secret";
  };
  var nextCategoryId = 5 : Nat;
  var nextChannelId = 5 : Nat;
  var nextAccountId = 3 : Nat;
  let activeSessions = Set.empty<Text>();

  // Conversions
  func idToText(id : Nat) : Text {
    id.toText();
  };

  // Seed Data
  func seedInitialData() {
    // Admin account
    accounts.add("1", { id = 1; username = "admin"; password = "147852"; role = "admin" });
    // Channel manager account (demo)
    accounts.add("2", { id = 2; username = "channelmanager"; password = "123456"; role = "channel_manager" });

    // Categories
    categories.add("1", { id = 1; name = "Bangla TV"; slug = "bangla-tv" });
    categories.add("2", { id = 2; name = "Radio"; slug = "radio" });
    categories.add("3", { id = 3; name = "News"; slug = "news" });
    categories.add("4", { id = 4; name = "International"; slug = "international" });

    // Channels
    channels.add(
      "1",
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
      "2",
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
      "3",
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
      "4",
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
  seedInitialData();

  // Auth Helpers
  func requireAuth(token : Text) {
    let session = sessions.get(token);
    switch (session) {
      case (null) { Runtime.trap("Session invalid!") };
      case (?_) { () };
    };
  };

  func requireAdmin(token : Text) {
    let session = sessions.get(token);
    switch (session) {
      case (null) { Runtime.trap("Session invalid!") };
      case (?session) {
        if (session.role != "admin") { Runtime.trap("Admin operation required!") };
      };
    };
  };

  public query ({ caller }) func validateSession(token : Text) : async Bool {
    sessions.containsKey(token);
  };

  // Auth
  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    let accountIter = accounts.values();
    let accountOpt = accountIter.find(func(account) { account.username == username and account.password == password });
    switch (accountOpt) {
      case (null) { Runtime.trap("Invalid login credentials!") };
      case (?account) {
        let token = username;
        let session = {
          id = token;
          username = account.username;
          role = account.role;
        };
        sessions.add(token, session);
        token;
      };
    };
  };

  public shared ({ caller }) func adminLogout(token : Text) : async Bool {
    switch (sessions.get(token)) {
      case (null) { Runtime.trap("Session invalid!") };
      case (?_) {
        sessions.remove(token);
        true;
      };
    };
  };

  public query ({ caller }) func getMyRole(token : Text) : async Text {
    switch (sessions.get(token)) {
      case (null) { "" };
      case (?session) { session.role };
    };
  };

  // Settings
  public query ({ caller }) func getSiteSettings() : async SiteSettings {
    settings;
  };

  public shared ({ caller }) func updateSiteSettings(newSettings : SiteSettings, token : Text) : async () {
    requireAdmin(token);
    settings := newSettings;
  };

  // Account CRUD
  public query ({ caller }) func getAccounts(token : Text) : async [Account] {
    requireAdmin(token);
    accounts.values().toArray();
  };

  public shared ({ caller }) func addAccount(username : Text, password : Text, role : Text, token : Text) : async () {
    requireAdmin(token);
    let account = {
      id = nextAccountId;
      username = username;
      password = password;
      role = role;
    };
    accounts.add(account.id.toText(), account);
    nextAccountId += 1;
  };

  public shared ({ caller }) func updateAccount(username : Text, password : Text, role : Text, token : Text) : async () {
    requireAdmin(token);
    let accountOpt = accounts.values().find(func(account) { account.username == username });
    switch (accountOpt) {
      case (null) { Runtime.trap("Account not found!") };
      case (?account) {
        if (account.username == "admin" and role != "admin") {
          Runtime.trap("Original admin must remain admin role!");
        };
        let shouldDelete = account.role != role;
        let accountToken = account.role;
        if (shouldDelete) {
          sessions.remove(accountToken);
        };
        let updatedAccount = {
          id = account.id;
          username;
          password;
          role;
        };
        accounts.add(updatedAccount.id.toText(), updatedAccount);
      };
    };
  };

  public shared ({ caller }) func deleteAccount(username : Text, token : Text) : async () {
    requireAdmin(token);
    if (username == "admin") { Runtime.trap("Original admin cannot be deleted!") };
    let accountIter = accounts.values();
    let accountOpt = accountIter.find(func(account) { account.username == username });
    switch (accountOpt) {
      case (null) { Runtime.trap("Account not found!") };
      case (?account) {
        accounts.remove(account.id.toText());
      };
    };
  };

  // Category CRUD
  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  public shared ({ caller }) func addCategory(name : Text, slug : Text, token : Text) : async () {
    requireAdmin(token);
    let category = {
      id = nextCategoryId;
      name;
      slug;
    };
    categories.add(category.id.toText(), category);
    nextCategoryId += 1;
  };

  public shared ({ caller }) func updateCategory(category : Category, token : Text) : async () {
    requireAdmin(token);
    switch (categories.get(category.id.toText())) {
      case (null) { Runtime.trap("Category not found!") };
      case (?_) {
        categories.add(category.id.toText(), category);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat, token : Text) : async () {
    requireAdmin(token);
    if (not categories.containsKey(id.toText())) {
      Runtime.trap("Category not found!");
    };
    categories.remove(id.toText());
  };

  // Channel CRUD
  public query ({ caller }) func getChannels() : async [Channel] {
    channels.values().toArray().filter(func(c) { c.isActive }).sort();
  };

  public query ({ caller }) func getAllChannels(token : Text) : async [Channel] {
    requireAuth(token);
    channels.values().toArray().sort();
  };

  public query ({ caller }) func getChannelById(id : Nat) : async Channel {
    switch (channels.get(id.toText())) {
      case (null) { Runtime.trap("Channel not found!") };
      case (?channel) { channel };
    };
  };

  public query ({ caller }) func getChannelsByCategory(categorySlug : Text) : async [Channel] {
    channels.values().toArray().filter(func(c) { c.isActive and c.category == categorySlug });
  };

  public shared ({ caller }) func addChannel(channel : Channel, token : Text) : async () {
    requireAuth(token);
    let newChannel = {
      channel with id = nextChannelId;
    };
    channels.add(newChannel.id.toText(), newChannel);
    nextChannelId += 1;
  };

  public shared ({ caller }) func updateChannel(channel : Channel, token : Text) : async () {
    requireAuth(token);
    switch (channels.get(channel.id.toText())) {
      case (null) { Runtime.trap("Channel not found!") };
      case (?_) {
        channels.add(channel.id.toText(), channel);
      };
    };
  };

  public shared ({ caller }) func deleteChannel(id : Nat, token : Text) : async () {
    requireAuth(token);
    if (not channels.containsKey(id.toText())) {
      Runtime.trap("Channel not found!");
    };
    channels.remove(id.toText());
  };

  // ApiSettings
  public query ({ caller }) func getApiSettings(token : Text) : async ApiSettings {
    requireAdmin(token);
    apiSettings;
  };

  public shared ({ caller }) func updateApiSettings(settings : ApiSettings, token : Text) : async () {
    requireAdmin(token);
    apiSettings := settings;
  };

  public query ({ caller }) func getChannelsApi(apiToken : Text) : async [Channel] {
    if (not apiSettings.enabled) {
      Runtime.trap("API is currently disabled. Please contact support for access.");
    };
    if (apiToken != apiSettings.apiToken) {
      Runtime.trap("Invalid API token");
    };
    channels.values().toArray().filter(func(c) { c.isActive }).sort();
  };

  // Bulk Import
  public shared ({ caller }) func importChannels(channelsToImport : [ChannelImport], token : Text) : async Nat {
    requireAuth(token);
    var successfulImports = 0;
    for (ch in channelsToImport.values()) {
      if (not channelNameExists(ch.name)) {
        let channel = {
          id = nextChannelId;
          name = ch.name;
          logoUrl = ch.logoUrl;
          streamUrl = ch.streamUrl;
          category = ch.category;
          description = ch.description;
          isActive = ch.isActive;
          order = ch.order;
        };
        channels.add(channel.id.toText(), channel);
        nextChannelId += 1;
        successfulImports += 1;
      };
    };
    successfulImports;
  };

  func channelNameExists(name : Text) : Bool {
    channels.values().toArray().find(func(c) { c.name == name }).isSome();
  };

  // Util
  public query ({ caller }) func getCategoriesDebug() : async [(Text, Category)] {
    categories.toArray();
  };

  public query ({ caller }) func getChannelsDebug() : async [(Text, Channel)] {
    channels.toArray();
  };

  public query ({ caller }) func getAccountsDebug() : async [(Text, Account)] {
    accounts.toArray();
  };
};
