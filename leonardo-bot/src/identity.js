// Random identity generator

const FIRST_NAMES = [
    'Aaron', 'Alex', 'Andre', 'Brian', 'Caleb', 'Daniel', 'Ethan',
    'Felix', 'Gabriel', 'Henry', 'Ivan', 'Jason', 'Kevin', 'Liam',
    'Marcus', 'Nathan', 'Oscar', 'Peter', 'Quentin', 'Ryan',
    'Samuel', 'Thomas', 'Victor', 'William', 'Xavier', 'Yusuf',
    'Zachary', 'Adam', 'Benjamin', 'Christopher', 'David', 'Edward',
    'Francis', 'George', 'Harold', 'Isaac', 'James', 'Joseph'
];

const LAST_NAMES = [
    'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Fisher',
    'Garcia', 'Harris', 'Johnson', 'King', 'Lewis', 'Martinez',
    'Nelson', 'Oliver', 'Parker', 'Quinn', 'Roberts', 'Smith',
    'Taylor', 'Underwood', 'Vargas', 'Wilson', 'Young', 'Zimmerman',
    'Adams', 'Baker', 'Carter', 'Edwards', 'Foster', 'Green',
    'Hall', 'Jones', 'Lopez', 'Mitchell', 'Phillips', 'Robinson'
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePassword() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const nums = '23456789';
    const syms = '!@#$%';
    let pwd = pick(upper);
    for (let i = 0; i < 3; i++) pwd += pick(lower);
    for (let i = 0; i < 3; i++) pwd += pick(nums);
    pwd += pick(syms);
    for (let i = 0; i < 4; i++) {
        pwd += pick(lower + upper + nums);
    }
    return pwd;
}

function generateIdentity() {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    return {
        firstName: first,
        lastName: last,
        fullName: first + ' ' + last,
        password: generatePassword(),
        createdAt: new Date().toISOString()
    };
}

module.exports = { generateIdentity, generatePassword };
