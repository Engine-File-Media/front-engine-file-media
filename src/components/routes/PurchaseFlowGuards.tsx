import { Navigate, Outlet, useParams } from 'react-router-dom';
import { resolveVolumeConfig } from '../../data/volumes';
import { canAccessPurchase, canAccessPurchaseResult } from '../../utils/storage';

export function RequirePurchaseEntry() {
  const { volumeId } = useParams<{ volumeId?: string }>();
  const resolvedVolume = resolveVolumeConfig(volumeId);

  if (!canAccessPurchase(resolvedVolume.id)) {
    return <Navigate to="/volume-i" replace />;
  }

  return <Outlet />;
}

export function RequirePurchaseResult() {
  if (!canAccessPurchaseResult()) {
    return <Navigate to="/volume-i" replace />;
  }

  return <Outlet />;
}
