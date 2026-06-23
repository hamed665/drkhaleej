import {
  OMAN_GEO_PROVIDER_INVENTORY_CONTRACTS,
  type OmanGeoProviderInventoryEntityContract,
} from '@/config/geo/provider-inventory-contract';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanGeoProviderInventoryLookupInput = {
  entity: OmanGeoRouteEntity;
};

export type OmanGeoProviderInventoryRuntimeState = {
  hasRuntimeEvidence: boolean;
  providerQueryAllowed: boolean;
  databaseAccessAllowed: boolean;
  publishedProviderCount: number;
  verifiedProviderCount: number;
  acceptsAppointmentsCount: number;
  indexPromotionAllowed: boolean;
  sitemapPromotionAllowed: boolean;
};

export function listOmanGeoProviderInventoryContracts(): readonly OmanGeoProviderInventoryEntityContract[] {
  return OMAN_GEO_PROVIDER_INVENTORY_CONTRACTS;
}

export function getOmanGeoProviderInventoryContract(
  input: OmanGeoProviderInventoryLookupInput,
): OmanGeoProviderInventoryEntityContract | null {
  return listOmanGeoProviderInventoryContracts().find((contract) => contract.entity === input.entity) ?? null;
}

export function getOmanGeoProviderInventoryRuntimeState(): OmanGeoProviderInventoryRuntimeState {
  const contracts = listOmanGeoProviderInventoryContracts();

  return {
    hasRuntimeEvidence: false,
    providerQueryAllowed: false,
    databaseAccessAllowed: false,
    publishedProviderCount: contracts.reduce((total, contract) => total + contract.publishedProviderCount, 0),
    verifiedProviderCount: contracts.reduce((total, contract) => total + contract.verifiedProviderCount, 0),
    acceptsAppointmentsCount: contracts.reduce((total, contract) => total + contract.acceptsAppointmentsCount, 0),
    indexPromotionAllowed: false,
    sitemapPromotionAllowed: false,
  };
}
