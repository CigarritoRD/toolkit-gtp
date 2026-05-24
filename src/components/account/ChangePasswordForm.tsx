import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import AppButton from '@/components/ui/AppButton'
import AppInput from '@/components/ui/AppInput'
import SectionCard from '@/components/ui/SectionCard'

export default function ChangePasswordForm() {
  const { t } = useTranslation()
  const { changePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const validate = () => {
    const errors: typeof fieldErrors = {}

    if (!currentPassword) {
      errors.currentPassword = t('profile.currentPasswordRequired')
    }

    if (!newPassword) {
      errors.newPassword = t('profile.newPasswordRequired')
    } else if (newPassword.length < 8) {
      errors.newPassword = t('auth.passwordMinLength')
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('profile.confirmPasswordRequired')
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      await changePassword(currentPassword, newPassword)
      toast.success(t('profile.passwordUpdated'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFieldErrors({})
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : t('profile.passwordUpdateError'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">
            {t('profile.changePasswordTitle')}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t('profile.changePasswordBody')}
          </p>
        </div>

        <AppInput
          label={t('profile.currentPassword')}
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            if (fieldErrors.currentPassword) {
              setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }))
            }
          }}
          error={fieldErrors.currentPassword}
          placeholder={t('profile.currentPasswordPlaceholder')}
          autoComplete="current-password"
        />

        <AppInput
          label={t('profile.newPassword')}
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            if (fieldErrors.newPassword) {
              setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
            }
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }
          }}
          error={fieldErrors.newPassword}
          placeholder={t('profile.newPasswordPlaceholder')}
          autoComplete="new-password"
        />

        <AppInput
          label={t('profile.confirmNewPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }
          }}
          error={fieldErrors.confirmPassword}
          placeholder={t('profile.confirmNewPasswordPlaceholder')}
          autoComplete="new-password"
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <AppButton type="submit" disabled={loading}>
            {loading ? t('common.saving') : t('profile.updatePassword')}
          </AppButton>
        </div>
      </form>
    </SectionCard>
  )
}