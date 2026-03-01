import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
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

  type Category = {
    id : Nat;
    name : Text;
    slug : Text;
  };

  type Channel = {
    id : Nat;
    name : Text;
    logoUrl : Text;
    streamUrl : Text;
    category : Text;
    description : Text;
    isActive : Bool;
    order : Nat;
  };

  type Session = {
    id : Text;
    username : Text;
    role : Text;
  };

  type ApiSettings = {
    enabled : Bool;
    apiToken : Text;
  };

  type OldActor = {
    accounts : Map.Map<Text, Account>;
    channels : Map.Map<Text, Channel>;
    categories : Map.Map<Text, Category>;
    sessions : Map.Map<Text, Session>;
    settings : SiteSettings;
    nextCategoryId : Nat;
    nextChannelId : Nat;
    nextAccountId : Nat;
  };

  type NewActor = {
    accounts : Map.Map<Text, Account>;
    channels : Map.Map<Text, Channel>;
    categories : Map.Map<Text, Category>;
    sessions : Map.Map<Text, Session>;
    settings : SiteSettings;
    nextCategoryId : Nat;
    nextChannelId : Nat;
    nextAccountId : Nat;
    apiSettings : ApiSettings;
  };

  public func run(old : OldActor) : NewActor {
    {
      accounts = old.accounts;
      channels = old.channels;
      categories = old.categories;
      sessions = old.sessions;
      settings = old.settings;
      nextCategoryId = old.nextCategoryId;
      nextChannelId = old.nextChannelId;
      nextAccountId = old.nextAccountId;
      apiSettings = {
        enabled = false;
        apiToken = "jagolive-api-secret";
      };
    };
  };
};
