import { useLocation, useSearchParams } from "react-router"

import { useAppState } from "@/components/app/app-provider"
import { SigninForm } from "@/components/auth/signin-form"
import { useI18n } from "@/lib/i18n/provider"
import { noindexRouteMeta } from "@/lib/seo"
import { useDocumentTitle } from "@/lib/use-document-title"

export function meta({
  matches,
}: {
  matches: Array<{ data?: unknown; loaderData?: unknown }>
}) {
  return noindexRouteMeta(matches, "Sign in", "登录")
}

export default function SigninRoute() {
  const { t } = useI18n()
  useDocumentTitle(t("user.signin.title"))
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const authError =
    typeof location.state === "object" &&
    location.state &&
    "authError" in location.state
      ? String(location.state.authError || "")
      : ""
  const { config } = useAppState()
  return (
    <section className="main">
      {authError ? (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground shadow">
          {authError}
        </div>
      ) : null}
      <div className="container">
        <div className="main-body no-bg auth-split">
          <aside className="auth-split-aside">
            <div className="font-mono text-micro font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Sign in
            </div>
            <h2 className="mt-4 font-heading text-h2 leading-tight font-bold">
              {config?.siteTitle || "BBS-GO"}
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {config?.siteDescription || ""}
            </p>
          </aside>
          <SigninForm
            redirect={searchParams.get("redirect") || undefined}
            config={config}
          />
        </div>
      </div>
    </section>
  )
}
