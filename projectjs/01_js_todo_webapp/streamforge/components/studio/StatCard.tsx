interface Props {
    label: string;
    value: string | number;
    subtext?: string;
    accent?: 'blue' | 'green' | 'purple' | 'amber';
}

export function StatCard({ label, value, subtext }: Props) {
    return (
        <div className="tick card p-5">
            <p className="text-paper-faint text-sm">{label}</p>
            <p className="font-display text-paper text-3xl font-bold mt-1 tabular-nums">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtext && (
                <p className="text-paper-faint text-xs mt-1">{subtext}</p>
            )}
        </div>
    );
}
