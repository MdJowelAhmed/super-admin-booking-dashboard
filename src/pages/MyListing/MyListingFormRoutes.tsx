import { useAppSelector } from '@/redux/hooks'
import CreateEditListingPage from './CreateEditListingPage'

/** `/my-listing/new` — super-admin only */
export function MyListingNewPage() {
  const { user } = useAppSelector((s) => s.auth)
  void user
  return <CreateEditListingPage />
}

/** `/my-listing/:id/edit` — super-admin only */
export function MyListingEditPage() {
  const { user } = useAppSelector((s) => s.auth)
  void user
  return <CreateEditListingPage />
}
