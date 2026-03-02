export const createGetUser = (supabase) => async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('No user logged in');
    }

    return user;
};

export const sanitizeNullableField = (value) => (value === '' ? null : value);

export const mapFundRecord = (record) => ({
    ...record,
    color: record.hex_color
});

export const mapGoalRecord = (record) => ({
    ...record,
    is_emergency_fund: record.type === 'emergency'
});
