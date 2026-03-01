import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  type OldCategory = {
    id : Nat;
    name : Text;
    slug : Text;
  };

  type OldChannel = {
    id : Nat;
    name : Text;
    logoUrl : Text;
    streamUrl : Text;
    category : Text;
    description : Text;
    isActive : Bool;
    order : Nat;
  };

  type OldActor = {
    categories : Map.Map<Nat, OldCategory>;
    channels : Map.Map<Nat, OldChannel>;
    activeSessions : Set.Set<Text>;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
