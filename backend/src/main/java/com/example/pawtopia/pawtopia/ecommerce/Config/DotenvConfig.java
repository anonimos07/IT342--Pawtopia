package com.example.pawtopia.pawtopia.ecommerce.Config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;

import java.util.Properties;

@Configuration
public class DotenvConfig {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer(ConfigurableEnvironment environment) {
        Dotenv dotenv = Dotenv.configure().load();

        Properties props = new Properties();
        // Load all properties from .env file
        dotenv.entries().forEach(entry -> props.put(entry.getKey(), entry.getValue()));

        environment.getPropertySources().addFirst(new PropertiesPropertySource("dotenvProperties", props));

        return new PropertySourcesPlaceholderConfigurer();
    }
}
