import { useLoaderData } from "react-router"

import { EmptyState } from "@/components/common/empty-state"
import { apiFetch } from "@/lib/api/client"
import type { FriendLink } from "@/lib/api/misc"
import { useI18n } from "@/lib/i18n/provider"
import { localizedTitle, pageMeta, rootDataFromMatches } from "@/lib/seo"
import { useDocumentTitle } from "@/lib/use-document-title"

function normalizeLinks(data: FriendLink[] | null | undefined) {
  return Array.isArray(data) ? data : []
}

export async function loader({ request }: { request: Request }) {
  return apiFetch<FriendLink[] | null>("/api/link/list", { request })
    .then(normalizeLinks)
    .catch(() => [])
}

export async function clientLoader() {
  return apiFetch<FriendLink[] | null>("/api/link/list")
    .then(normalizeLinks)
    .catch(() => [])
}

export function meta({
  location,
  matches,
}: {
  location: { pathname: string }
  matches: Array<{ data?: unknown; loaderData?: unknown }>
}) {
  const rootData = rootDataFromMatches(matches)
  return pageMeta(
    rootData?.config,
    localizedTitle(rootData?.locale, "Links", "友情链接"),
    { canonicalPath: location.pathname }
  )
}

export default function LinksRoute() {
  const links = useLoaderData<typeof loader>()
  const { t } = useI18n()
  useDocumentTitle(t("pages.links.title"), { appendSiteTitle: false })

  return (
    <section className="main">
      <div className="container mx-auto max-w-[1000px]">
        <div className="mb-6 flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
          <h1 className="text-h2 font-semibold text-foreground">
            {t("pages.links.title")}
          </h1>
        </div>
        {links.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <li
                key={link.id}
                className="border border-border p-4 transition-colors hover:border-foreground"
              >
                <a
                  href={link.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-base font-semibold break-all text-foreground transition-colors hover:text-primary"
                  title={link.title}
                >
                  {link.title}
                </a>
                {link.summary ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-[1.7] break-all text-muted-foreground">
                    {link.summary}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t("common.noData")} />
        )}
      </div>
    </section>
  )
}
