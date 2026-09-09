import { query } from '../config/database.js';

// Get complete hierarchy data
export const getHierarchy = async (req, res) => {
  try {
    // Get all districts
    const districts = await query(
      'SELECT * FROM districts ORDER BY district_name'
    );

    const hierarchyData = [];

    for (const district of districts) {
      const districtData = {
        ...district,
        cooperatives: []
      };

      // Get cooperatives for this district
      const cooperatives = await query(
        'SELECT * FROM cooperatives WHERE district_id = ? ORDER BY cooperative_name',
        [district.district_id]
      );

      for (const cooperative of cooperatives) {
        const cooperativeData = {
          ...cooperative,
          families: [],
          leaders: [],
          sectors: []
        };

        // Get cooperative leaders
        const leaders = await query(`
          SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
          FROM members m
          JOIN member_positions mp ON m.member_id = mp.member_id
          JOIN positions p ON mp.position_id = p.position_id
          WHERE m.cooperative_id = ? AND p.level = 'Cooperative' AND p.sector = 'Leader'
          LIMIT 1
        `, [cooperative.cooperative_id]);

        cooperativeData.leaders = leaders;

        // Get cooperative sector leaders
        const sectors = await query(`
          SELECT DISTINCT p.sector 
          FROM positions p 
          JOIN member_positions mp ON p.position_id = mp.position_id
          JOIN members m ON mp.member_id = m.member_id
          WHERE m.cooperative_id = ? AND p.level = 'Cooperative' AND p.sector != 'Leader'
          ORDER BY FIELD(p.sector, 'Political', 'Financial', 'Structural')
        `, [cooperative.cooperative_id]);

        const sectorData = [];

        for (const sector of sectors) {
          const sectorLeaders = await query(`
            SELECT m.member_id, m.full_name, m.photo, p.position_name
            FROM members m
            JOIN member_positions mp ON m.member_id = mp.member_id
            JOIN positions p ON mp.position_id = p.position_id
            WHERE m.cooperative_id = ? AND p.sector = ? AND p.level = 'Cooperative'
          `, [cooperative.cooperative_id, sector.sector]);

          sectorData.push({
            sector: sector.sector,
            leaders: sectorLeaders
          });
        }

        cooperativeData.sectors = sectorData;

        // Get families for this cooperative
        const families = await query(
          'SELECT * FROM families WHERE cooperative_id = ? ORDER BY family_name',
          [cooperative.cooperative_id]
        );

        for (const family of families) {
          const familyData = {
            ...family,
            leader: null,
            sectorLeaders: [],
            members: []
          };

          // Get family leader
          const familyLeader = await query(`
            SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
            FROM members m
            JOIN member_positions mp ON m.member_id = mp.member_id
            JOIN positions p ON mp.position_id = p.position_id
            WHERE m.family_id = ? AND p.level = 'Family' AND p.sector = 'Leader'
            LIMIT 1
          `, [family.family_id]);

          if (familyLeader.length > 0) {
            familyData.leader = familyLeader[0];
          }

          // Get family sector leaders
          const familySectorLeaders = await query(`
            SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
            FROM members m
            JOIN member_positions mp ON m.member_id = mp.member_id
            JOIN positions p ON mp.position_id = p.position_id
            WHERE m.family_id = ? AND p.level = 'Family' AND p.sector != 'Leader' AND p.sector != 'Member'
          `, [family.family_id]);

          familyData.sectorLeaders = familySectorLeaders;

          // Get family members
          const familyMembers = await query(`
            SELECT m.member_id, m.full_name, m.photo
            FROM members m
            JOIN member_positions mp ON m.member_id = mp.member_id
            JOIN positions p ON mp.position_id = p.position_id
            WHERE m.family_id = ? AND (p.sector = 'Member' OR p.sector = '' OR p.sector IS NULL)
          `, [family.family_id]);

          familyData.members = familyMembers;

          cooperativeData.families.push(familyData);
        }

        districtData.cooperatives.push(cooperativeData);
      }

      hierarchyData.push(districtData);
    }

    res.json({
      success: true,
      data: hierarchyData
    });
  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get hierarchy for a specific cooperative (for leaders)
export const getCooperativeHierarchy = async (req, res) => {
  try {
    const { cooperativeId } = req.params;

    // Get cooperative details
    const cooperative = await query(
      'SELECT * FROM cooperatives WHERE cooperative_id = ?',
      [cooperativeId]
    );

    if (cooperative.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cooperative not found'
      });
    }

    // Get cooperative leaders
    const leaders = await query(`
      SELECT m.member_id, m.full_name, m.photo, p.position_name, p.sector
      FROM members m
      JOIN member_positions mp ON m.member_id = mp.member_id
      JOIN positions p ON mp.position_id = p.position_id
      WHERE m.cooperative_id = ? AND p.level = 'Cooperative' AND p.sector = 'Leader'
      LIMIT 1
    `, [cooperativeId]);

    // Get families for this cooperative
    const families = await query(
      'SELECT * FROM families WHERE cooperative_id = ? ORDER BY family_name',
      [cooperativeId]
    );

    const familyData = [];

    for (const family of families) {
      const data = {
        ...family,
        leader: null,
        sectorLeaders: [],
        members: []
      };

      // Get family leader
      const familyLeader = await query(`
        SELECT m.member_id, m.full_name, m.photo, p.position_name
        FROM members m
        JOIN member_positions mp ON m.member_id = mp.member_id
        JOIN positions p ON mp.position_id = p.position_id
        WHERE m.family_id = ? AND p.level = 'Family' AND p.sector = 'Leader'
        LIMIT 1
      `, [family.family_id]);

      if (familyLeader.length > 0) {
        data.leader = familyLeader[0];
      }

      // Get family members
      const members = await query(`
        SELECT m.member_id, m.full_name, m.photo
        FROM members m
        JOIN member_positions mp ON m.member_id = mp.member_id
        JOIN positions p ON mp.position_id = p.position_id
        WHERE m.family_id = ? AND (p.sector = 'Member' OR p.sector = '' OR p.sector IS NULL)
      `, [family.family_id]);

      data.members = members;

      familyData.push(data);
    }

    res.json({
      success: true,
      data: {
        cooperative: cooperative[0],
        leaders: leaders,
        families: familyData
      }
    });
  } catch (error) {
    console.error('Get cooperative hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};