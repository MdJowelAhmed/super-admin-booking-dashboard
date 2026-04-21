import { useEffect, useState } from 'react'
import { Shield, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapEditor } from '@/components/common'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from '@/redux/api/settings'

function getErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'message' in err.data &&
    typeof (err.data as { message: unknown }).message === 'string'
  ) {
    return (err.data as { message: string }).message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

export default function PrivacySettings() {
  const { user } = useAppSelector((state) => state.auth)
  const canManage = user?.role === UserRole.SUPER_ADMIN

  const { data, isLoading, isError, isSuccess, error } =
    useGetPlatformSettingsQuery('privacyPolicy')
  const [updateSettings, { isLoading: isSaving }] = useUpdatePlatformSettingsMutation()

  const [privacy, setPrivacy] = useState('')
  const [activeTab, setActiveTab] = useState('preview')

  useEffect(() => {
    if (data == null) return
    setPrivacy(typeof data.data === 'string' ? data.data : '')
  }, [data])

  const handleSave = async () => {
    try {
      await updateSettings({ privacyPolicy: privacy }).unwrap()
      toast({
        title: 'Privacy Policy updated',
        description: 'Privacy Policy has been updated successfully.',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not save Privacy Policy',
        description: getErrorMessage(err),
      })
    }
  }

  const previewHtml = isSuccess ? privacy : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  {canManage
                    ? "Manage your platform's Privacy Policy"
                    : 'Read-only preview of the Privacy Policy'}
                </CardDescription>
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || isSaving}
                  isLoading={isSaving}
                  className="bg-primary text-white hover:bg-primary/80"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !data ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Loading…</p>
          ) : isError ? (
            <p className="text-sm text-destructive py-6">{getErrorMessage(error)}</p>
          ) : canManage ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="edit" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-0">
                <TiptapEditor
                  content={privacy}
                  onChange={setPrivacy}
                  placeholder="Write your privacy policy here..."
                  className="min-h-[500px]"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="border rounded-xl p-6 min-h-[500px] bg-muted/20">
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
