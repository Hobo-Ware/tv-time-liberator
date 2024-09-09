export type Series = {
    id: number;
    uuid: string
    title: string;
    status: 'stopped' | 'continuing' | 'up_to_date' | 'not_started_yet';
}