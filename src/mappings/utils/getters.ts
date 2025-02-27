import { Event } from '../../processable';
import {
  MarketplaceOfferAcceptedEvent, MarketplaceOfferPlacedEvent, MarketplaceOfferWithdrawnEvent, MarketplaceRoyaltyAddedEvent, MarketplaceRoyaltyPaidEvent, MarketplaceTokenPriceUpdatedEvent, MarketplaceTokenSoldEvent, NftClassCreatedEvent, NftClassDestroyedEvent, NftCollectionCreatedEvent, NftCollectionDestroyedEvent, NftInstanceBurnedEvent, NftInstanceMintedEvent, NftInstanceTransferredEvent, NftItemBurnedEvent, NftItemMintedEvent, NftItemTransferredEvent,
} from '../../types/events';
import { addressOf, isNewUnique, toPercent } from './helper';
import {
  BurnTokenEvent, CreateCollectionEvent, CreateTokenEvent, DestroyCollectionEvent, TransferTokenEvent, Context, ListTokenEvent, BuyTokenEvent, AddRoyaltyEvent, PayRoyaltyEvent, WithdrawOfferEvent, MakeOfferEvent, AcceptOfferEvent,
} from './types';

export function getCreateCollectionEvent(ctx: Context): CreateCollectionEvent {
  if (isNewUnique(ctx, Event.createCollection)) {
    const event = new NftCollectionCreatedEvent(ctx);
    const {
      collectionId: classId, owner, collectionType: classType,
    } = event.asV81;
    return {
      id: classId.toString(), caller: addressOf(owner), metadata: undefined, type: classType.__kind,
    };
  }

  const event = new NftClassCreatedEvent(ctx);
  // logger.debug('NftClassCreatedEvent', event.isV39)
  if (event.isV42) {
    const {
      classId, owner, metadata, classType,
    } = event.asV42;
    return {
      id: classId.toString(), caller: addressOf(owner), metadata: metadata.toString(), type: classType.__kind,
    };
  }

  if (event.isV62) {
    const {
      classId, owner, classType,
    } = event.asV62;
    return {
      id: classId.toString(), caller: addressOf(owner), metadata: undefined, type: classType.__kind,
    };
  }

  const {
    classId, owner, metadata, classType,
  } = event.asV71;
  return {
    id: classId.toString(), caller: addressOf(owner), metadata: metadata.toString(), type: classType.__kind,
  };
}

export function getCreateTokenEvent(ctx: Context): CreateTokenEvent {
  if (isNewUnique(ctx, Event.createItem)) {
    const event = new NftItemMintedEvent(ctx);
    const {
      itemId: instanceId, collectionId: classId, owner, metadata,
    } = event.asV81;
    return {
      collectionId: classId.toString(), caller: addressOf(owner), sn: instanceId.toString(), metadata: metadata.toString(),
    };
  }

  const event = new NftInstanceMintedEvent(ctx);
  // logger.debug('NftInstanceMintedEvent', event.isV39)
  // if (event.isV39) {
  //   const { classId, owner, instanceId } = event.asV39;
  //   return { collectionId: classId.toString(), caller: addressOf(owner), sn: instanceId.toString() };
  // }
  // if (event.isV50) {
  //   const { classId, owner, instanceId, metadata } = event.asV50;
  //   return { collectionId: classId.toString(), caller: addressOf(owner), sn: instanceId.toString(), metadata: metadata.toString() };
  // }

  const {
    classId, owner, instanceId, metadata,
  } = event.asV71;
  return {
    collectionId: classId.toString(), caller: addressOf(owner), sn: instanceId.toString(), metadata: metadata.toString(),
  };
}

export function getTransferTokenEvent(ctx: Context): TransferTokenEvent {
  if (isNewUnique(ctx, Event.transferItem)) {
    const event = new NftItemTransferredEvent(ctx);
    const {
      collectionId, itemId, from, to,
    } = event.asV81;
    return {
      collectionId: collectionId.toString(), caller: addressOf(from), sn: itemId.toString(), to: addressOf(to),
    };
  }

  const event = new NftInstanceTransferredEvent(ctx);
  const {
    classId, instanceId, from, to,
  } = event.asV42;
  return {
    collectionId: classId.toString(), caller: addressOf(from), sn: instanceId.toString(), to: addressOf(to),
  };
}

export function getBurnTokenEvent(ctx: Context): BurnTokenEvent {
  if (isNewUnique(ctx, Event.burnItem)) {
    const event = new NftItemBurnedEvent(ctx);
    const { collectionId, itemId, owner } = event.asV81;
    return { collectionId: collectionId.toString(), caller: addressOf(owner), sn: itemId.toString() };
  }

  const event = new NftInstanceBurnedEvent(ctx);
  const { classId, instanceId, owner } = event.asV42;
  return { collectionId: classId.toString(), caller: addressOf(owner), sn: instanceId.toString() };
}

export function getDestroyCollectionEvent(ctx: Context): DestroyCollectionEvent {
  if (isNewUnique(ctx, Event.destroyCollection)) {
    const event = new NftCollectionDestroyedEvent(ctx);
    const { collectionId, owner } = event.asV81;
    return { id: collectionId.toString(), caller: addressOf(owner) };
  }

  const event = new NftClassDestroyedEvent(ctx);
  const { classId, owner } = event.asV42;
  return { id: classId.toString(), caller: addressOf(owner) };
}

export function getListTokenEvent(ctx: Context): ListTokenEvent {
  const event = new MarketplaceTokenPriceUpdatedEvent(ctx);
  if (event.isV55) {
    const {
      who: owner, class: classId, instance: instanceId, price,
    } = event.asV55;
    return {
      collectionId: classId.toString(), caller: addressOf(owner), sn: instanceId.toString(), price,
    };
  }

  const {
    who: owner, collection: classId, item: instanceId, price,
  } = event.asV81;
  return {
    collectionId: classId.toString(), caller: addressOf(owner), sn: instanceId.toString(), price,
  };
}

export function getBuyTokenEvent(ctx: Context): BuyTokenEvent {
  const event = new MarketplaceTokenSoldEvent(ctx);
  if (event.isV55) {
    const {
      owner: from, buyer: to, class: classId, instance: instanceId, price,
    } = event.asV55;
    return {
      collectionId: classId.toString(), caller: addressOf(to), sn: instanceId.toString(), price: BigInt(price ?? 0), currentOwner: addressOf(from),
    };
  }
  const {
    owner: from, buyer: to, collection: classId, item: instanceId, price,
  } = event.asV81;
  return {
    collectionId: classId.toString(), caller: addressOf(to), sn: instanceId.toString(), price: BigInt(price ?? 0), currentOwner: addressOf(from),
  };
}

export function getAddRoyaltyEvent(ctx: Context): AddRoyaltyEvent {
  const event = new MarketplaceRoyaltyAddedEvent(ctx);
  if (event.isV55 || event.isV75) {
    const {
      class: classId, instance: instanceId, author: recipient, royalty,
    } = event.isV55 ? event.asV55 : event.asV75;
    return {
      collectionId: classId.toString(), sn: instanceId.toString(), recipient: addressOf(recipient), royalty: event.isV55 ? royalty : toPercent(royalty),
    };
  }

  const {
    collection: classId, item: instanceId, author: recipient, royalty,
  } = event.asV81;
  return {
    collectionId: classId.toString(), sn: instanceId.toString(), recipient: addressOf(recipient), royalty: event.isV55 ? royalty : toPercent(royalty),
  };
}

export function getPayRoyaltyEvent(ctx: Context): PayRoyaltyEvent {
  const event = new MarketplaceRoyaltyPaidEvent(ctx);
  if (event.isV55 || event.isV75) {
    const {
      class: classId, instance: instanceId, author: recipient, royalty, royaltyAmount: amount,
    } = event.isV55 ? event.asV55 : event.asV75;
    return {
      collectionId: classId.toString(), sn: instanceId.toString(), recipient: addressOf(recipient), royalty: event.isV55 ? royalty : toPercent(royalty), amount,
    };
  }

  const {
    collection: classId, item: instanceId, author: recipient, royalty, royaltyAmount: amount,
  } = event.asV81;
  return {
    collectionId: classId.toString(), sn: instanceId.toString(), recipient: addressOf(recipient), royalty: event.isV55 ? royalty : toPercent(royalty), amount,
  };
}

export function getPlaceOfferEvent(ctx: Context): MakeOfferEvent {
  const event = new MarketplaceOfferPlacedEvent(ctx);
  // if (event.isV39) {
  //   const [caller, class: classId, instance: instanceId,, amount] = event.asV39;
  //   return { collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), amount, expiresAt: BigInt(0), };
  // }

  if (event.isV55) {
    const {
      who: caller, class: classId, instance: instanceId, amount, expires: blockNumber,
    } = event.asV55;
    return {
      collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), amount, expiresAt: BigInt(blockNumber),
    };
  }

  const {
    who: caller, collection: classId, item: instanceId, amount, expires: blockNumber,
  } = event.asV81;
  return {
    collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), amount, expiresAt: BigInt(blockNumber),
  };
}

export function getWithdrawOfferEvent(ctx: Context): WithdrawOfferEvent {
  const event = new MarketplaceOfferWithdrawnEvent(ctx);

  if (event.isV55) {
    const { who: caller, class: classId, instance: instanceId } = event.asV55;
    return { collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), maker: addressOf(ctx.event.call?.args.maker) };
  }

  const { who: caller, collection: classId, item: instanceId } = event.asV81;
  return { collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), maker: addressOf(ctx.event.call?.args.maker) };
}

export function getAcceptOfferEvent(ctx: Context): AcceptOfferEvent {
  const event = new MarketplaceOfferAcceptedEvent(ctx);
  // if (event.isV39) {
  //   const [caller, class: classId, instance: instanceId,, amount] = event.asV39;
  //   return { collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), amount, maker: '' };
  // }

  if (event.isV62) {
    const {
      who: caller, class: classId, instance: instanceId, amount, maker,
    } = event.asV62;
    return {
      collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), amount, maker: addressOf(maker),
    };
  }

  const {
    who: caller, collection: classId, item: instanceId, amount, maker,
  } = event.asV81;
  return {
    collectionId: classId.toString(), sn: instanceId.toString(), caller: addressOf(caller), amount, maker: addressOf(maker),
  };
}
