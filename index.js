const DB = [
  {
    p_key: 'CONFIG',
    s_key: 'main',
    data: {
      unis: [
        {
          uni: 'STG',
          urlPrefix: 'https://stg.com',
          studentUrl: 'https://{STUDENT_NUMBER}.stg.com',
          adminLink: 'https://admin-{ADMIN_NUMBER}.stg.com',
        },
        {
          uni: 'OI',
          urlPrefix: 'https://oi.com',
          studentUrl: 'https://{STUDENT_NUMBER}.oi.com',
          adminLink: 'https://admin-{ADMIN_NUMBER}.oi.com',
        },
      ],
    },
  },

  { p_key: 'STG#CONFIG', university_name: 'Staging' },
  { p_key: 'OI#CONFIG', university_name: 'Oxford international' },

  { p_key: 'STG#1000', s_key: 'STUDENT_DETAILS', data: { name: 'name - 1' } },
  { p_key: 'OI#2000', s_key: 'STUDENT_DETAILS', data: { name: 'name - 2' } },
  { p_key: 'STG#4000', s_key: 'STUDENT_DETAILS', data: { name: 'name - 4' } },
  { p_key: 'STG#5000', s_key: 'STUDENT_DETAILS', data: { name: 'name - 5' } },

  { p_key: 'STG#1000', s_key: 'FINANCE', data: { deposit: 200 } },
  { p_key: 'OI#2000', s_key: 'FINANCE', data: { deposit: 400 } },
  { p_key: 'STG#4000', s_key: 'FINANCE', data: { deposit: 700 } },
  { p_key: 'STG#5000', s_key: 'FINANCE', data: { deposit: 100 } },

  { p_key: 'OI#MANAGER', s_key: 'main', hasAccess: ['2000'] },
  { p_key: 'STG#MANAGER', s_key: 'main', hasAccess: ['4000', '5000'] },

  { p_key: 'STG#1000', s_key: 'USER#STUDENT' },
  { p_key: 'OI#2000', s_key: 'USER#STUDENT' },
  { p_key: 'ADM#STG#3000', s_key: 'USER#ADMIN' },
  { p_key: 'ADM#STG#7000', s_key: 'USER#ADMIN' },
  { p_key: 'STG#4000', s_key: 'USER#STUDENT' },
  { p_key: 'STG#5000', s_key: 'USER#STUDENT' },
  { p_key: 'ADM#OI#6000', s_key: 'USER#ADMIN' },
];

const getAllUsersByUni = (uni) => {
  const uniInfo = getUni(uni);
  const uniUrl = getUniUrl(uni);
  const students = getAllStudents(uni);
  const admins = getAllAdmins(uni);

  const response = {};

  response.uni = uniInfo.university_name;
  response.shortCode = uni;
  response.uniUrl = uniUrl.urlPrefix;
  response.students = students;
  response.admins = admins;

  return response;
};

const getUni = (uni) => {
  return DB.find(config => {
    return config.p_key === `${uni}#CONFIG`;
  })
}

const getSettings = () => {
  return DB.find(config => {
    return config.p_key === `CONFIG`;
  })
}

const getUniUrl = (uni) => {
  const settings = getSettings();

  return settings.data.unis.find(config => {
    return config.uni === uni;
  })
}

const getAllStudents = (uni) => {
  const allStudents = [];

  const getStudentDetails = DB.filter(config => {
    return config.p_key.includes(`${uni}#`) && config.s_key === 'STUDENT_DETAILS'
  });
  const getStudentFinance = DB.filter(config => {
    return config.p_key.includes(`${uni}#`) && config.s_key === 'FINANCE'
  });

  for (let info of getStudentDetails) {
    const student = {};
    const number = info.p_key.replace(/\D/g, '');
    const url = getUniUrl(uni);
    const studentUrl = url.studentUrl.replace('{STUDENT_NUMBER}', number)

    student.studentNumber = number;
    student.uni = uni;
    student.name = info.data.name;
    student.studentUrl = studentUrl;

    for (let depo of getStudentFinance) {
      if (info.p_key === depo.p_key) {
        student.deposit = depo.data.deposit
      }
    }
    allStudents.push(student);
  }
  return allStudents
}

const getAdmins = (uni) => {
  return DB.filter(config => {
    return config.p_key.includes(`ADM#${uni}#`);
  })
}

const getManager = (uni) => {
  return DB.find(config => {
    return config.p_key === `${uni}#MANAGER`;
  })
}

const getAllAdmins = (uni) => {
  const adminObject = {};

  adminObject.shortCode = 'ADM';
  adminObject.list = [];

  const admins = getAdmins(uni);
  const manager = getManager(uni);
  const students = manager.hasAccess;

  for (let admin of admins) {
    const adminToPush = {}
    const id = admin.p_key.replace(/\D/g, '');
    const url = getUniUrl(uni);
    const adminLink = url.adminLink.replace('{ADMIN_NUMBER}', id);

    adminToPush.id = id;
    adminToPush.link = adminLink;
    adminToPush.students = []

    for (let student of students) {
      const studentToPush = {};
      const studentUrl = url.studentUrl.replace('{STUDENT_NUMBER}', student);

      studentToPush.studentNumber = student;
      studentToPush.studentUrl = studentUrl;

      adminToPush.students.push(studentToPush);
    }
    adminObject.list.push(adminToPush)
  }
  return adminObject
}

const stgUsers = getAllUsersByUni('STG');
console.log(stgUsers);