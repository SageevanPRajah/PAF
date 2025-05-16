package com.roboticgen.nexus.config;

import com.roboticgen.nexus.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.roboticgen.nexus.oauth2.CustomOAuth2UserService;
import com.roboticgen.nexus.oauth2.OAuth2AuthenticationSuccessHandler;
import com.roboticgen.nexus.service.UserService;
import com.roboticgen.nexus.config.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

@Configuration
public class OAuth2BeansConfiguration {

    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
        return new HttpCookieOAuth2AuthorizationRequestRepository();
    }

    @Bean
    public CustomOAuth2UserService customOAuth2UserService(UserService userService) {
        return new CustomOAuth2UserService(userService);
    }

    @Bean
    public OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler(
            JwtService jwtService,
            UserService userService
    ) {
        return new OAuth2AuthenticationSuccessHandler(jwtService, userService);
    }
}
