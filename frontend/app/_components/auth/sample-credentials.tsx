import { SAMPLE_CREDENTIALS } from "@/app/_lib/sample-credentials";

export default function SampleCredentials() {
  return (
    <div className="mt-6 rounded-xl  bg-muted/30 p-5">
      <h2 className="mb-4 text-lg font-semibold">
        Demo Credentials
      </h2>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {SAMPLE_CREDENTIALS.map((credential) => (
          <div
            key={credential.role}
            className="rounded-lg border bg-background p-4"
          >
            <div className="mb-3">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                {credential.role}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">
                  Email
                </p>
                <code className="block break-all rounded bg-muted px-2 py-1 text-xs">
                  {credential.email}
                </code>
              </div>

              <div>
                <p className="text-muted-foreground">
                  Password
                </p>
                <code className="block rounded bg-muted px-2 py-1 text-xs">
                  {credential.password}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">
                Role
              </th>
              <th className="px-4 py-3 font-medium">
                Email
              </th>
              <th className="px-4 py-3 font-medium">
                Password
              </th>
            </tr>
          </thead>

          <tbody>
            {SAMPLE_CREDENTIALS.map((credential) => (
              <tr
                key={credential.role}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                    {credential.role}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {credential.email}
                  </code>
                </td>

                <td className="px-4 py-3">
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {credential.password}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}