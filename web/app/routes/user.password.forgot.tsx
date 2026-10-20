import { useAppState } from "@/components/app/app-provider"
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms"
import { useI18n } from "@/lib/i18n/provider"
import { noindexRouteMeta } from "@/lib/seo"
import { useDocumentTitle } from "@/lib/use-document-title"

export function meta({
  matches,
}: {
  matches: Array<{ data?: unknown; loaderData?: unknown }>
}) {
  return noindexRouteMeta(matches, "Forgot password", "找回密码")
}

export default function ForgotRoute() {
  const { t } = useI18n()
  const { config } = useAppState()
  useDocumentTitle(t("user.passwordReset.forgot.title"))
  return (
    <section className="main">
      <div className="container">
        <div className="main-body no-bg auth-split">
          <aside className="auth-split-aside">
            <div className="font-mono text-micro font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Reset
            </div>
            <h2 className="mt-4 font-heading text-h2 leading-tight font-bold">
              {t("user.passwordReset.forgot.title")}
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {config?.siteDescription || ""}
            </p>
          </aside>
          <div className="signin-card">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </section>
  )
}
