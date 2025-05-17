package com.roboticgen.nexus.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.roboticgen.nexus.model.Module;


@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {}
